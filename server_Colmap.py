from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pyngrok import ngrok
import firebase_admin
from firebase_admin import credentials, storage
from firebase_admin.exceptions import FirebaseError
import os
import subprocess
import shutil
import pycolmap
import pathlib
import open3d as o3d
import numpy as np

cred = credentials.Certificate('life-s-b2719-firebase-adminsdk-k192e-b04f65c82b.json')
firebase_admin.initialize_app(cred, {
    'storageBucket' : 'life-s-b2719.appspot.com'
})

bucket = storage.bucket()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.status_code = 200
        return response
    
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Origin"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Origin"] = "Content-Type, Authorization"

def download_images(uid):
    folder_name = uid + '/images/reconstruct'
    local_dir = 'images/reconstruct'
    os.makedirs(local_dir, exist_ok=True)
    blobs = bucket.list_blobs(prefix=folder_name)

    for blob in blobs:
        local_path = os.path.join(local_dir, os.path.relpath(blob.name, folder_name))
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

    if not blob.name.endswith('/'):
      blob.download_to_filename(local_path)
      print(f'Downloaded {blob.name} to {local_path}')
      blob.delete()
      print(f"Deleted {blob.name} from Firebase Storage")

def upload_file(bucket, local_file, destination_path):
    blob = bucket.blob(destination_path)
    blob.upload_from_filename(local_file)
    print(f'Uploaded {local_file} to {destination_path}')

def upload_meshes(uid):
    bucket = storage.bucket()
    upload_file(bucket, "/content/point cloud/mvs/dense.ply", uid + '/results/dense.ply')
    upload_file(bucket, "/content/point cloud/mvs/dense.obj", uid + '/results/dense.obj')
    print("Finished Uploading")

    point_cloud_folder = "/content/point cloud"
    if os.path.exists(point_cloud_folder):
        shutil.rmtree(point_cloud_folder)
        print(f"Deleted Folder: {point_cloud_folder}")

def dense_reconstruction():
    output_path = pathlib.Path("point_cloud")
    image_dir = pathlib.Path("images")

    print("Creating Directories")
    output_path.mkdir(parents=True, exist_ok=True)
    mvs_path = output_path / "mvs"
    database_path = output_path / "database.db"

    print("Starting Sparse Reconstruction")
    pycolmap.extract_features(database_path, image_dir, options={'num_threads': 8, 'SIFT_max_num_features': 4000})
    pycolmap.match_vocabulary_tree(database_path, image_dir)
    maps = pycolmap.incremental_mapping(database_path, image_dir, output_path)
    maps[0].write(output_path)

    print("Starting Dense Reconstruction")
    pycolmap.undistort_images(mvs_path, output_path, image_dir)
    pycolmap.patch_match_stereo(mvs_path, options={'PatchMatchStereo.max_image_size': 1600})
    pycolmap.stereo_fusion(mvs_path / "dense.ply", mvs_path, options={'StereoFusion.min_num_pixels': 5})

def generate_mesh():
    print("Reading Point Cloud")
    pcd_raw = o3d.io.read_point_cloud("/content/point cloud/mvs/dense.ply")

    print("Downsampling Point Cloud")
    pcd = pcd_raw.voxel_down_sample(voxel_size=0.01)

    print("Removing Outliers")
    cl, ind = pcd.remove_statistical_outlier(nb_neighbors=10, std_ratio=2.0)
    pcd = pcd.select_by_index(ind)

    print("Estimating Normals")
    pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.02, max_nn=30))
    pcd.orient_normals_towards_camera_location(camera_location=(0.0, 0.0, 0.0))

    print("Generating Mesh with Poisson Reconstruction")
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
        pcd, depth=8, scale=1.1, linear_fit=True
    )

    print("Trimming Low-Density Areas")
    densities = np.asarray(densities)
    vertices_to_remove = densities < np.quantile(densities, 0.01)
    mesh.remove_vertices_by_mask(vertices_to_remove)

    print("Applying Rotation")
    mesh.rotate(mesh.get_rotation_matrix_from_xyz((np.pi, 0, 0)), center=mesh.get_center())

    print("Saving Optimized Mesh")
    o3d.io.write_triangle_mesh("/content/point cloud/mvs/dense.obj", mesh, write_ascii=False, compressed=True)

@app.route('/status', methods=['POST'])
def status():
    server_status = "running"

    firebase_status = "connected"
    try:
        blobs = bucket.list_blobs(max_results=1)
    except FirebaseError as e:
        firebase_status = f"Error: {str(e)}"
    
    status_response = {
        "server" : server_status,
        "firebase" : firebase_status,
        "message" : "server is operational"
    }

    return jsonify(status_response)

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    print("Hello, World!")
    print(f"Received Data: {data}")


    download_images()
    dense_reconstruction()
    generate_mesh()
    upload_meshes()

    return jsonify({"status": "success", "message": "Webhook Received"})

if __name__ == '__main__':
    # Replace 'your-authtoken' with the actual authtoken you got from ngrok
    ngrok.set_auth_token('2lgsFcb8grI0o8ScngYQK6GAOJf_5JdDrnQRQx9KpPeVsp5cK')

    # Open a tunnel to the local Flask server on port 5000
    public_url = ngrok.connect(5001)
    print(f"ngrok Tunnel URL: {public_url}")

    # Start the Flask server
    app.run(host='0.0.0.0', port=5001)
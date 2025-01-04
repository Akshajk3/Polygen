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

os.environ['SF3D_USE_CPU'] = '1'

cred = credentials.Certificate('life-s-b2719-firebase-adminsdk-k192e-b04f65c82b.json')
firebase_admin.initialize_app(cred, {
    'storageBucket' : 'life-s-b2719.appspot.com'
})

bucket = storage.bucket()

# Set up Flask app and enable CORS for all routes
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.status_code = 200
        return response

def download_images(uid):
  folder_name = uid + '/images/'
  local_dir = 'images'
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

def upload_mesh(uid):

    bucket = storage.bucket()
    upload_file(bucket, "output/0/mesh.glb", uid + '/results/mesh.glb')
    print("Finished Uploading")

    os.remove('output/0/mesh.glb')

    for image in os.listdir('images'):
        os.remove('images/' + image)

def generate_images():

    for image in os.listdir('images'):
       img_name = image

    command = [
        "python3",
        "run.py",
        "images/" + img_name,
        "--output-dir",
        "output/"
    ]

    try:
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        print("Command Executed Successufly")
        print("Output: \n",result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error During Execution: ")
        print("Return Code: ", e.returncode)
        print("Error Message", e.stderr)

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
    print(f"Received Data: {data}")

    uid = data.get("uid")
    if not uid:
       return jsonify({"status": "error", "message": "UID is missing"}), 400

    download_images(uid)
    generate_images()
    upload_mesh(uid)

    socketio.emit('models_ready', {'status': 'Models are ready for download'})

    return jsonify({"status": "success", "message": "Webhook Received"})

if __name__ == '__main__':
    # Start Ngrok tunnel to the Flask server on port 5001
    ngrok.set_auth_token('2lgsFcb8grI0o8ScngYQK6GAOJf_5JdDrnQRQx9KpPeVsp5cK')
    public_url = ngrok.connect(5001)
    print(f"Ngrok Tunnel URL: {public_url}")
    
    app.run(host='0.0.0.0', port=5001)
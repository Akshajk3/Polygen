import React, { useEffect, useState } from "react";
import { storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import stepOne from "../img/Step One.png";
import stepTwo from "../img/StepTwo.png";
import stepThree from "../img/StepThree.png"
import { getAuth } from "firebase/auth";
import { io } from "socket.io-client";
import { error } from "firebase-functions/logger";


const Upload = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    var userID;
    
    if (user) {
        userID = user.uid;
    } else {
        console.error("Error: No User Logged In");
    }

    const [images, setImages] = useState([]);
    const [done, setDone] = useState(false)
    const [statusMessage, setStatusMessage] = useState("");
    const [checkInterval, setCheckInterval] = useState(null);
    const [notified, setNotified] = useState(false);
    const serverURL = "https://8f36-34-16-147-134.ngrok-free.app";

    const socket = io(serverURL, {
        transports: ["websocket"],
        withCredentials: true
    });

    useEffect(() => {
        socket.on("models_ready", (data) => {
            if (data.status === "Models are ready for download") {
                setDone(true);
                setStatusMessage("Models Successfully Generated!");
            }
        });

        return() => {
            socket.disconnect();
        }
    }, [socket]);

    const checkServerStatus = async () => {
        try {
            const response = await fetch(serverURL + "/status", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({status_check: true}),
            });

            if (response.ok) {
                const data = response.json();
                if (data.server === "running" && data.firebase === "connected") {
                    return true;
                } else {
                    console.error("Server issue detected", data);
                    return false;
                }
            } else {
                console.error("Server not responsive, staus check failed");
                return false;
            }
        } catch (error) {
            console.error("Error checking server status " + error);
            return false;
        }
    }
    
    const sendDataToServer = async () => {
        try {
            const response = await fetch(serverURL + "status", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    images_ready: true,
                    uid: userID,
                })
            });

            if (response.ok) {
                setStatusMessage("Images Uploaded Successfully!");
            } else {
                setStatusMessage("Failed to Upload Images :(");
            }
        }
        catch (error) {
            console.error("Error seding data: ", error);
            setStatusMessage("Error Notifying Server");
        }
    }

    const handleSend = async () => {
        if (images.length === 0) {
            console.log("No Files selected.");
            return;
        }

        setDone(false);

        const serverStatus = await checkServerStatus();

        if (!serverStatus) {
            setStatusMessage("Server is not responding. Please try again later");
            return;
        }
    
        setStatusMessage("Uploading...");
    
        for (const img of images) {
            const directory_path = userID + "/images/reconstruct/";
            const storageRef = ref(storage, directory_path + uuid());
            const uploadTask = uploadBytesResumable(storageRef, img);
            
            try {
                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        null,
                        (error) => {
                            console.error("Upload failed:", error);
                            reject(error);
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                console.log("File available at:", downloadURL);
                            });
                            resolve();
                        }
                    );
                });
                sendDataToServer();
            } catch (error) {
                console.error("Error uploading images:", error);
                setStatusMessage("Error uploading image.");
            }
        }

    };

    const downloadModels = async () => {
        if (done) {
            const pointCloudReference = ref(storage, 'results/dense.ply');
            const meshReference = ref(storage, 'results/dense.obj');
            const doneFileRef = ref(storage, 'results/done.txt');
            
            try {
                const pointCloudURL = await getDownloadURL(pointCloudReference);
                const meshURL = await getDownloadURL(meshReference);

                const pointCloudResponse = await fetch(pointCloudURL);
                const pointCloudBlob = await pointCloudResponse.blob();
                const pointCloudLink = document.createElement('a');
                pointCloudLink.href = URL.createObjectURL(pointCloudBlob);
                pointCloudLink.download = 'dense.ply';
                pointCloudLink.click();

                const meshResponse = await fetch(meshURL);
                const meshBlob = await meshResponse.blob();
                const meshLink = document.createElement('a');
                meshLink.href = URL.createObjectURL(meshBlob);
                meshLink.download = 'dense.obj';
                meshLink.click();

                deleteObject(pointCloudReference);
                deleteObject(meshReference);
                deleteObject(doneFileRef);

            } catch(error) {
                console.error("Error downloading models: ", error);
                setStatusMessage("Error downloading models, please try again");
            }
        }
        else {
            console.log("Error: Model Not Done Generating")
            setStatusMessage("Generating Models...")
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setImages((prevImages) => [...prevImages, ...files]);
        }
        e.currentTarget.classList.remove("drag-over");
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add("drag-over");
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("drag-over");
    };


    return (
        <div className="upload-page">
        <div className="blob"></div> {/* Animated Blob */}
        <div className="input-container">
            <div className="info-text">
                This app allows you to <span>upload images</span> and converts them into <span>3D models</span>!
            </div>

            <div className="send-container">
                <input
                    type="file"
                    multiple
                    className="file-input"
                    id="file"
                    onChange={(e) => setImages([...e.target.files])}
                />

                <div className="grid grid-cols-3 gap-4">
                    {images.length > 0 &&
                        images.map((img, index) => (
                            <img
                                className="preview-image"
                                key={index}
                                src={URL.createObjectURL(img)}
                                alt={`Selected ${index}`}
                            />
                        ))}
                </div>

                {done && setStatusMessage("Models Ready for Download!")
                (
                    <button className="download-button" onClick={downloadModels}>
                        Download Models
                    </button>
                )}

                <p className="status-message">{statusMessage}</p>
                <div className="extra-info">
                    Make sure to upload high-quality images for the best 3D models!
                </div>
            </div>

            <div
                className="drag-drop-area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p>Drag & Drop your files here or click the button above</p>
            </div>
            <button className="upload-button" onClick={handleSend}>
                Upload
            </button>
        </div>

            <div className="instructions-section">
                <h2 className="instructions-title">How to Use the App</h2>

                <div className="instruction-step">
                    <div className="step-text">
                        <h3>Step 1:</h3>
                        <p>
                            <strong>Upload High-Quality Images:</strong>
                            <p>
                                Choose multiple high-resolution images of the object you want to turn into a 3D model.
                                Ensure that you capture images from different angles for the best results.
                                Clear, well-lit images will improve the accuracy of the 3D model.
                            </p>
                            <strong>
                            <a href="./images.zip" download>Example Dataset</a>
                            </strong>
                        </p>
                    </div>
                    <img src={stepOne} alt="Step 1" className="slanted-image" />
                </div>

                <div className="instruction-step alternate">
                    <div className="step-text">
                        <h3>Step 2:</h3>
                        <p>
                            <strong>Wait for the 3D Model to Generate:</strong>
                            <p>   
                                After uploading, the system will process your images to create a dense 3D model.
                                This can take a few minutes depending on the number and quality of the images.
                                Be patient as the model is being generated.
                            </p>
                        </p>
                    </div>
                    <img src={stepTwo} alt="Step 2" className="slanted-image" />
                </div>

                <div className="instruction-step">
                    <div className="step-text">
                        <h3>Step 3:</h3>
                        <p>
                            <strong>Download Your 3D Model:</strong>
                            <p>
                                Once the 3D model is ready, you'll be able to download both the point cloud
                                and mesh files (in .ply and .obj formats). You can use these files for visualization
                                or further editing in 3D software.
                            </p>
                        </p>
                    </div>
                    <img src={stepThree} alt="Step 3" className="slanted-image" />
                </div>
            </div>
        </div>

    );
};

export default Upload;
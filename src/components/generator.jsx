import React, { useEffect, useState } from "react";
import { storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { uploadBytesResumable, getDownloadURL, ref, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { io } from "socket.io-client";

const SF3DUpload = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    var userID;

    if (user) {
        userID = user.uid;
    } else {
        console.error("Error: No User Logged In")
    }

    const [image, setImage] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [done, setDone] = useState(false)
    const [parameters, setParameters] = useState({
        foregroundRatio: 0.85,  // default value from the Python code
        textureResolution: 1024, // default value from the Python code
        remeshOption: "none", // default value from the Python code
        targetVertexCount: -1, // default value from the Python code
        batchSize: 1 // default value from the Python code
    });
    const serverURL = "https://21a7-104-33-80-102.ngrok-free.app/";

    const socket = io(serverURL, {
        transports: ["websocket"],  // Ensures WebSocket transport is used
        withCredentials: true,       // Send credentials if required
      });

    useEffect(() => {
        socket.on("models_ready", (data) => {
            if (data.status === "Models are ready for download") {
                setDone(true);
                setStatusMessage("Model Successfully Generated!");
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    const checkServerStatus = async () => {
        try {
            const response = await fetch(serverURL + "status", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({status_check : true}),
            });

            if (response.ok) {
                const data = response.json();
                if (data.server === "running" && data.firebase === "connected") {
                    return true; // server and firebase are working correctly
                } else {
                    console.error("Server issue detected", data);
                    return false;
                }
            } else {
                console.error("Server not responsive, status check failed");
                return false;
            }
        } catch (error) {
            console.error("Error checking server status " + error);
            return false;
        }
    }

    const sendDataToServer = async () => {
        try {
            const response = await fetch(serverURL + "webhook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    images_ready: true,
                    uid: userID,
                    parameters: parameters
                })
            });

            if (response.ok) {
                setStatusMessage("Image Uploaded Successfully!");
            } else {
                setStatusMessage("Failed to Upload Image :(");
            }
        }
        catch (error) {
            console.error("Error sending data: ", error);
            setStatusMessage("Error Notifying Server");
        }
    }

    const downloadModel = async() => {
        const fileRef = ref(storage, userID + '/results/mesh.glb');

        try {
            const fileURL = await getDownloadURL(fileRef);
            const fileResponse = await fetch(fileURL);
            const fileBlob = await fileResponse.blob()
            const fileLink = document.createElement('a');
            fileLink.href = URL.createObjectURL(fileBlob);
            fileLink.download = 'mesh.glb';
            fileLink.click();

            deleteObject(fileRef);
        } catch (error) {
            console.error("Error Downloading Model: ", error);
            setStatusMessage("Error Downloading Model, Please Try Again");
        }
    };

    const handleSend = async () => {
        if (!image) {
            setStatusMessage("No image selected.");
            return;
        }
        setDone(false);
        
        const serverStatus = await checkServerStatus();

        if (!serverStatus) {
            setStatusMessage("Server is not responding. Please try again later");
            return;
        }

        setStatusMessage("Uploading...");
        const directoryPath = userID + "/images/generate/";
        const storageRef = ref(storage, directoryPath + uuid());
        const uploadTask = uploadBytesResumable(storageRef, image);

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
                            sendDataToServer();
                        });
                        resolve();
                    }
                );
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            setStatusMessage("Error uploading image.");
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    // Handle parameter input change
    const handleParameterChange = (e) => {
        const { name, value } = e.target;
        setParameters((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    return (
        <div className="upload-page">
            <div className="blob"></div>
            <div className="input-container">
                <div className="info-text">
                    This app allows you to upload an image and provide parameters to generate a 3D model using SF3D.
                </div>

                <div className="send-container">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="file-input"
                        id="file"
                    />
                    {image && <img src={URL.createObjectURL(image)} alt="Selected" className="preview-image" />}

                    <div className="parameter-inputs">
                        <label>
                            Foreground Ratio:
                            <input
                                type="number"
                                name="foregroundRatio"
                                value={parameters.foregroundRatio}
                                onChange={handleParameterChange}
                                step="0.01"
                                min="0"
                                max="1"
                                placeholder="e.g., 0.85"
                            />
                        </label>

                        <label>
                            Texture Resolution:
                            <input
                                type="number"
                                name="textureResolution"
                                value={parameters.textureResolution}
                                onChange={handleParameterChange}
                                min="512"
                                max="4096"
                                placeholder="e.g., 1024"
                            />
                        </label>

                        <label>
                            Remesh Option:
                            <select
                                name="remeshOption"
                                value={parameters.remeshOption}
                                onChange={handleParameterChange}
                            >
                                <option value="none">None</option>
                                <option value="triangle">Triangle</option>
                                <option value="quad">Quad</option>
                            </select>
                        </label>

                        <label>
                            Target Vertex Count:
                            <input
                                type="number"
                                name="targetVertexCount"
                                value={parameters.targetVertexCount}
                                onChange={handleParameterChange}
                                placeholder="e.g., 1000000 or leave as -1"
                            />
                        </label>

                        <label>
                            Batch Size:
                            <input
                                type="number"
                                name="batchSize"
                                value={parameters.batchSize}
                                onChange={handleParameterChange}
                                min="1"
                                max="16"
                                placeholder="e.g., 1"
                            />
                        </label>
                    </div>

                    {done && (
                        <button className="download-button" onClick={downloadModel}>
                            Download Model
                        </button>
                    )}

                    <button className="upload-button" onClick={handleSend}>
                        Upload
                    </button>
                    <p className="status-message">{statusMessage}</p>
                </div>
            </div>
        </div>
    );
};

export default SF3DUpload;
import React, { useEffect, useState } from "react";
import { storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { uploadBytesResumable, getDownloadURL, ref, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { io } from "socket.io-client";
import stepOne from "../img/Step One.png";
import stepTwo from "../img/StepTwo.png";
import stepThree from "../img/StepThree.png"
import { div } from "three/webgpu";
//hi
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
    const [showSettings, setShowSettings] = useState(false);

    const openSettings = () => setShowSettings(true);
    const closeSettings = () => setShowSettings(false);

    const saveSettings = (e) => {
        e.preventDefault();
        const newSettings = {
            foregroundRatio: parseFloat(e.target.foregroundRatio.value),
            textureResolution: parseInt(e.target.textureResolution.value, 10),
            remeshOption: e.target.remeshOption.value,
            targetVertexCount: parseInt(e.target.targetVertexCount.value, 10),
            batchSize: parseInt(e.target.batchSize.value, 10),
        };
        setParameters(newSettings);
        closeSettings();
    };

    const serverURL = "http://192.168.1.183:5001/";

    const socket = io(serverURL);

    useEffect(() => {
        socket.on("models_ready", (data) => {
            if (data.status === "Models are ready for download") {
                setDone(true);
                setStatusMessage("Model Successfuly Generated!");
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
        
        const serverStatus = checkServerStatus();

        if (!serverStatus) {
            setStatusMessage("Server is not responding. Please try again later");
            return;
        }

        setStatusMessage("Uploading...");
        const directoryPath = userID + "/images/";
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
        const file = e.target.files;
        if (file.length > 1) {
            setImage(null);
            setStatusMessage("Please select only one image.");
        }
        else if (file.length === 1 && file[0].type.startsWith('image/')) {
            setImage(file[0]);
            setStatusMessage("");
        }
        else {
            setImage(null);
            setStatusMessage("Please select an image file.");
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
                    This app allows you to upload image(s) and converts them into 3D models using SF3D!
                </div>
                <div className="send-container">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="file-input"
                        id="file"   
                    />
                    {image && <img src={URL.createObjectURL(image)} alt="Selected" className="preview-image" />}

                    {/* settings module */}
                    {showSettings && (
                    <div className="settings-modal">
                        <div className="settings-content">
                            <h2>Settings</h2>
                            <form onSubmit={saveSettings}>
                                <label>
                                    Foreground Ratio:
                                    <input
                                        type="number"
                                        name="foregroundRatio"
                                        defaultValue={parameters.foregroundRatio}
                                        step="0.01"
                                        min="0"
                                        max="1"
                                    />
                                </label>
                                <label>
                                    Texture Resolution:
                                    <input
                                        type="number"
                                        name="textureResolution"
                                        defaultValue={parameters.textureResolution}
                                        min="512"
                                        max="4096"
                                    />
                                </label>
                                <label>
                                    Remesh Option:
                                    <select
                                        name="remeshOption"
                                        defaultValue={parameters.remeshOption}
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
                                        defaultValue={parameters.targetVertexCount}
                                        placeholder="e.g., 1000000"
                                    />
                                </label>
                                <label>
                                    Batch Size:
                                    <input
                                        type="number"
                                        name="batchSize"
                                        defaultValue={parameters.batchSize}
                                        min="1"
                                        max="16"
                                    />  
                                </label>
                                <div className="settings-buttons">
                                    <button type="submit" className="save-button">
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={closeSettings}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
            )}
                    {/* <div className="parameter-inputs">
                        <label className="parameter-label">
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
                                className="parameter-input"
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
                                className="parameter-input"
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
                    </div> */}
                    {done && (
                        <button className="download-button" onClick={downloadModel}>
                            Download Model
                        </button>
                    )}

                    <button className="upload-button" onClick={handleSend}>
                        Upload
                    </button>
                    <button className="settings-button" onClick={openSettings}>
                        Settings
                    </button>
                    <p className="status-message">{statusMessage}</p>
                </div>
            </div>
            <div className="instructions-section">
                <h2 className="instructions-title">How to Use Generate</h2>

                <div className="instruction-step">
                    <div className="step-text">
                        <h3>Step 1:</h3>
                        <p>
                            <strong>Upload A High Quality:</strong>
                            <p>
                                Choose a high-quality image of the object you want to turn into a 3D model. The image should be clear and well-lit to ensure the best results. Have little to no distractions/objects in the background.
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

export default SF3DUpload;
import React, { useState } from "react";
import { storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
import { getAuth } from "firebase/auth";

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
    const [parameters, setParameters] = useState({
        // Replace these with actual parameters supported by sf3d
        param1: "",
        param2: "",
        param3: "",
    });
    const webhookURL = "YOUR_SF3D_WEBHOOK_URL";

    const handleSend = async () => {
        if (!image) {
            setStatusMessage("No image selected.");
            return;
        }

        setStatusMessage("Uploading...");
        const directoryPath = "images/" + userID;
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

                            // Send the image URL and parameters to the sf3d server
                            fetch(webhookURL, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    image_url: downloadURL,
                                    parameters: parameters,
                                }),
                            })
                            .then((response) => {
                                if (response.ok) {
                                    setStatusMessage("Request sent successfully.");
                                } else {
                                    setStatusMessage("Failed to send request.");
                                }
                            })
                            .catch((error) => {
                                console.error("Error sending request:", error);
                                setStatusMessage("Error notifying server.");
                            });
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
                        <input
                            type="text"
                            name="param1"
                            value={parameters.param1}
                            onChange={handleParameterChange}
                            placeholder="Parameter 1"
                        />
                        <input
                            type="text"
                            name="param2"
                            value={parameters.param2}
                            onChange={handleParameterChange}
                            placeholder="Parameter 2"
                        />
                        <input
                            type="text"
                            name="param3"
                            value={parameters.param3}
                            onChange={handleParameterChange}
                            placeholder="Parameter 3"
                        />
                    </div>

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
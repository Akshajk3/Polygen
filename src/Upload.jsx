import React, { useEffect, useState } from "react";
import { storage } from "./firebase";
import { v4 as uuid } from "uuid";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import stepOne from "./img/Step One.png";
import stepTwo from "./img/StepTwo.png";
import stepThree from "./img/StepThree.png"

const Upload = () => {
    const [images, setImages] = useState([]);
    const [done, setDone] = useState(false)
    const [statusMessage, setStatusMessage] = useState("");
    const [checkInterval, setCheckInterval] = useState(null);
    const [notified, setNotified] = useState(false);
    const webhookURL = "https://8f36-34-16-147-134.ngrok-free.app/webhook";

    const handleSend = async () => {
        if (images.length === 0) {
            console.log("No Files selected.");
            return;
        }
    
        if (notified) {
            console.log("Already notified.");
            return;
        }
    
        setStatusMessage("Uploading...");
        let uploadPromises = [];
        let uploadedImageURLs = [];
    
        images.forEach((img) => {
            const directory_path = 'images/';
            const storageRef = ref(storage, directory_path + uuid());
            const uploadTask = uploadBytesResumable(storageRef, img);
    
            const uploadPromise = new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        // Optionally monitor progress here
                    },
                    (error) => {
                        console.error("Upload failed:", error);
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            console.log("File available at:", downloadURL);
                            uploadedImageURLs.push(downloadURL); // Store the download URL
                            resolve();
                        });
                    }
                );
            });
            uploadPromises.push(uploadPromise);
        });
    
        try {
            await Promise.all(uploadPromises);
            console.log("All images uploaded successfully");
    
            setStatusMessage("Generating Models...");
    
            // Notify the Colab server via a webhook after all images are uploaded
            const response = await fetch(webhookURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: uuid(), // Add user ID or other identifier here
                    images_ready: true,
                    image_urls: uploadedImageURLs, // Send the list of uploaded image URLs to the server
                }),
            });
    
            if (response.ok) {
                console.log("Server notified successfully");
                setNotified(true); // Mark as notified
            } else {
                console.error("Failed to notify server");
                setStatusMessage("Error notifying server");
            }
        } catch (error) {
            console.error("Error uploading images or notifying server:", error);
            //setStatusMessage("Error during upload please try again.");
        }
    };

    const checkForFinish = async () => {
        try {
            const doneFileRef = ref(storage, 'results/done.txt');
            await getDownloadURL(doneFileRef);
            setDone(true);
            setStatusMessage("Models are ready for download");

            if (checkInterval) {
                clearInterval(checkInterval);
                setCheckInterval(null);
            }
        }
        catch (error) {
            if (error.code === 'storage/object-not-found') {
                console.log('done file not found retrying...');
            } else {
                console.log('Error: ', error);
                setStatusMessage("Error while generating models");
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

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Checking for Finish");
            checkForFinish();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

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

                {done && (
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
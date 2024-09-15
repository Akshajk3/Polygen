import React, { useEffect, useState } from "react";
import { storage } from "./firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import Attach from "./img/paper-clip.png";

const Upload = () => {
    const [images, setImages] = useState([]);
    const [done, setDone] = useState(false)
    const [statusMessage, setStatusMessage] = useState("");
    const [checkInterval, setCheckInterval] = useState(null);
    const [notified, setNotified] = useState(false);
    const webhookURL = "https://f16a-34-173-65-12.ngrok-free.app/webhook"; // Your Colab notebook webhook URL

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
            setStatusMessage("Error during upload please try again.");
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

    return (
        <div className="input">
            <div className="send" style={{ paddingTop: "100px", textAlign: "center" }}>
                <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    id="file"
                    onChange={(e) => setImages([...e.target.files])}
                />
                <label htmlFor="file">
                    {images.length > 0 ? (
                        images.map((img, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(img)}
                                alt={`Selected ${index}`}
                                style={{ width: 50, height: 50, marginRight: 5 }}
                            />
                        ))
                    ) : (
                        <img src={Attach} alt="Attach" />
                    )}
                </label>
                <button onClick={handleSend}>Upload</button>
                { done && (
                <button onClick={downloadModels} style={{marginTop : '20px'}}>Download Models</button>
                )}
                <p>{statusMessage}</p>
            </div>
        </div>
    );
};

export default Upload;
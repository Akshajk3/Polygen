import React, {useContext, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import { storage } from "./firebase"
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Attach from "./img/paper-clip.png"


const Upload = () => {
    const [images, setImages] = useState([]);


    const handleSend = async() => {

        if (images.length == 0) {
            console.log("No Files selected.")
            return;
        }
        
        images.forEach((img) => {
        const directory_path = 'images/'
        
        const storageRef = ref(storage, directory_path + uuid());
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
            "state_changed", // State changes (progress, etc.)
            (snapshot) => {
                // You can monitor progress here if needed
            },
            (error) => {
                console.error("Upload failed:", error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at:", downloadURL);
                    // You can handle the download URL further here
                });
            }
        );})
    }

    return(
        <div className="input">
            <div className="send" style={{paddingTop: "100px", textAlign: "center" }}>
                {/* <img src={Attach} alt="Attach" /> */}
                <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    id="file"
                    onChange={(e) => setImages([...e.target.files])}
                />
                <label htmlFor="file">
                    {/* If img is selected, display a preview */}
                    {images.length > 0 ? (
                        images.map((img, index) => (
                            <img
                                key = {index}
                                src={URL.createObjectURL(img)}
                                alt={`Selected ${index}`}
                                style={{width : 50, height : 50, marginRight : 5}}
                            />
                        ))
                    ) : (
                        <img src={Attach} alt="Attach" />
                    )}
                </label>
                <button onClick={handleSend}>Upload</button>
            </div>
        </div>
    )
}

export default Upload
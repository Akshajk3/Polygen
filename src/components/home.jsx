import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import { OBJLoader, OrbitControls } from 'three-stdlib';
import kay from "../img/kayoncomp.jpeg"
import aki from "../img/aki.jpeg"

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const viewerRef = useRef();

    const handleStartGenerating = () => {
        if (currentUser) {
            navigate('/upload');
        } else {
            navigate('/login');
        }
    };

    // setup Three.js 3D Model Viewer
    useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, viewerRef.current.clientWidth / viewerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    viewerRef.current.appendChild(renderer.domElement);

    // add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // more focused light
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // load the 3D model using OBJLoader
    const loader = new OBJLoader();
    loader.load('/dense.obj', (object) => {
        object.scale.set(0.5, 0.5, 0.5);
        scene.add(object);
    }, undefined, (error) => {
        console.error('Error loading the 3D model:', error);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    camera.position.z = 5;

    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        if (viewerRef.current) {
            viewerRef.current.removeChild(renderer.domElement);
        }
    };
}, []);

    return (
        <div className="homepage-container">
            <section className="hero-section">
                <video autoPlay muted loop className="background-video">
                    <source src="sampleclip.mp4" type="video/mp4" />
                </video>
                <div className="hero-content">
                    {/* <h1 className="hero-title">Polygen</h1> */}
                    <img src="polygen.png" alt="Logo" className="heroimg" />
                    <p className="hero-subtitle">Making your imagination reality</p>
                    <button className="start-button" onClick={handleStartGenerating}>Start Generating</button>
                </div>
            </section>

            {/*yt tut */}
            <section className="tutorial-section">
                <h2>How to use Polygen</h2>
                <div className="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/QpwJEYGCngI"
                        title="Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="tutorial-video"
                    ></iframe>
                    <div className="left-design-element"></div>
                    <div className="right-design-element"></div>
                </div>
            </section>

            {/* 3d model viewer */}
            <section className="viewer-section">
                <h2>Sample 3D Model (Using a professional dataset) </h2>
                <div ref={viewerRef} className="model-viewer"></div>
            </section>

            <section className="credits-section">
                <h2>Credits</h2>
                <div className="credits-container">
                    <div className="credit-item">
                        <img src={kay} alt="Person 1" className="credit-image" />
                        <div className="credit-details">
                            <h3>Kshitij Singhal</h3>
                            <p>iamkay556@gmail.com</p>
                        </div>
                    </div>

                    <div className="credit-item">
                        <img src={aki} alt="Person 2" className="credit-image" />
                        <div className="credit-details">
                            <h3>Akshaj Kanumuri</h3>
                            <p>akshaj.kanumuri@gmail.com</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;


// // <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
//         <div className="landing-container">
//             <div className='blob'/>
//             <header className="landing-header">
//                 <h1>Welcome to LifeScan</h1>
//                 <p>Your personalized AI solution for life-scanning technology.</p>
//             </header>
            
//             <div className="blob-3d"/>
            
//             <button className="start-button" onClick={handleStartGenerating}>
//                 Start Generating
//             </button>
//         </div>
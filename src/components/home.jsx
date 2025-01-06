import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import { OBJLoader, OrbitControls } from 'three-stdlib';

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    // const viewerRef = useRef();

    const scrollToSection = (section) => {
        document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
    };

    const handleStartGenerating = () => {
        if (currentUser) {
            navigate('/upload');
        } else {
            navigate('/login');
        }
    };

    // setup Three.js 3D Model Viewer
//     useEffect(() => {
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, viewerRef.current.clientWidth / viewerRef.current.clientHeight, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
//     viewerRef.current.appendChild(renderer.domElement);

//     // add lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
//     scene.add(ambientLight);
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // more focused light
//     directionalLight.position.set(1, 1, 1);
//     scene.add(directionalLight);

//     // load the 3D model using OBJLoader
//     // const loader = new OBJLoader();
//     // loader.load('/dense.obj', (object) => {
//     //     object.scale.set(0.5, 0.5, 0.5);
//     //     scene.add(object);
//     // }, undefined, (error) => {
//     //     console.error('Error loading the 3D model:', error);
//     // });

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;

//     camera.position.z = 5;

//     const animate = () => {
//         requestAnimationFrame(animate);
//         controls.update();
//         renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//         if (viewerRef.current) {
//             viewerRef.current.removeChild(renderer.domElement);
//         }
//     };
// }, []);

    return (

        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Transform Your Vision into 3D Reality</h1>
                    <p>
                        With Polygen, seamlessly turn your images into stunning 3D models.
                        Join the revolution in digital transformation.
                    </p>
                    <button onClick={() => scrollToSection('features')} className="cta-button">
                        Explore Features
                    </button>
                </div>
                <div className="hero-visual">
                    <img src="/hero-graphic.png" alt="3D Graphic" />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2>Features That Empower You</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <img src="/icon-upload.png" alt="Upload" />
                        <h3>Seamless Upload</h3>
                        <p>Easily upload images to create high-quality 3D models.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/icon-speed.png" alt="Speed" />
                        <h3>Fast Processing</h3>
                        <p>Experience rapid 3D model generation with cutting-edge algorithms.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/icon-quality.png" alt="Quality" />
                        <h3>Unmatched Quality</h3>
                        <p>Generate models with industry-grade precision and detail.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <h2>Ready to Start Your 3D Journey?</h2>
                <p>
                    Polygen makes 3D modeling accessible to everyone. Get started now
                    and bring your ideas to life.
                </p>
                <button className="cta-button">Get Started</button>
            </section>
        </div>

        // <div className="homepage-container">
        //     <section className="hero-section">
        //         <div className="blob"></div>
        //         <div className="hero-content">
        //             {/* <h1 className="hero-title">Polygen</h1> */}
        //             <img src="polygen.png" alt="Logo" className="heroimg" />
        //             <p className="hero-subtitle">Making your imagination reality</p>
        //             <button className="start-button" onClick={handleStartGenerating}>Start Generating</button>
        //         </div>
        //     </section>
        // </div>

        
    );
};

export default Home;
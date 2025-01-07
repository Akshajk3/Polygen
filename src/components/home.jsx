import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three-stdlib';

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const canvasRefs = [useRef(), useRef(), useRef()];

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

    useEffect(() => {
        canvasRefs.forEach((canvasRef, index) => {
            if (!canvasRef.current) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
            canvasRef.current.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            scene.add(ambientLight);

            const loader = new GLTFLoader();
            const modelPaths = [
                '/groot.glb',
                '/purse.glb',
                '/models/mesh3.glb',
            ];

            loader.load(
                modelPaths[index],
                (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(1.5, 1.5, 1.5);
                    scene.add(model);
                    animate();
                },
                undefined,
                (error) => {
                    console.error(`Error loading 3D model ${index + 1}:`, error);
                }
            );

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            camera.position.set(0, 1, 5);

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };

            return () => {
                if (renderer.domElement && canvasRef.current) {
                    canvasRef.current.removeChild(renderer.domElement);
                }
            };
        });
    }, []);

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Transform Your Vision into 3D Reality</h1>
                    <p>
                        With Polygen, seamlessly turn your images into stunning and editable 3D models.
                    </p>
                    <button onClick={handleStartGenerating} className="cta-button">
                        Get Started
                    </button>
                    <button onClick={scrollToSection.bind(null, 'features')} className="cta-button" style={{ marginLeft: '10px' }}>
                        Learn More
                    </button>
                </div>
            </section>
            <section id="features" className="features-section">
                <h2>Features That Empower You</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <img src="/icon-upload.png" alt="Upload" />
                        <h3>Ease of Access</h3>
                        <p>Easily upload images to create high-quality 3D models.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/icon-speed.png" alt="Speed" />
                        <h3>Be 10x faster.</h3>
                        <p>Create 3D models automatically without any experience in 3D designing. Speed up your design process and save time.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/icon-quality.png" alt="Quality" />
                        <h3>Save money.</h3>
                        <p>Polygen focuses on being a low-cost solution in order to be accessible to everyone. </p>
                    </div>
                </div>
            </section>
            <div className="three-display-section">
                <h2>Explore 3D Models</h2>
                <div className="three-display-grid">
                    <div className="three-display-box" ref={canvasRefs[0]} style={{ width: '300px', height: '300px' }}></div>
                    <div className="three-display-box" ref={canvasRefs[1]} style={{ width: '300px', height: '300px' }}></div>
                    <div className="three-display-box" ref={canvasRefs[2]} style={{ width: '300px', height: '300px' }}></div>
                </div>
            </div>
            <section className="cta-section">
                <h2>Ready to Start Your 3D Journey?</h2>
                <p>
                    Polygen makes 3D modeling accessible to everyone. Get started now
                    and bring your ideas to life.
                </p>
                <button className="cta-button">Get Started</button>
            </section>
        </div>
    );
};

export default Home;

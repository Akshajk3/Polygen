import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doSignOut } from '../auth';
import { auth } from '../firebase';

const Header = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);

    console.log(userLoggedIn);

    const handleLogout = async () => {
        await doSignOut(auth);
        navigate('/login');
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true); // Enable blur effect
            } else {
                setIsScrolled(false); // Remove blur effect
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <header className={`headernav ${isScrolled ? 'nav-blur' : ''}`}>
                {userLoggedIn ? (
                    <nav className="headernav">
                        <div>
                            <img onClick={() => navigate('/home')} src="polygen.png" alt="Logo" className="logoimg" />
                        </div>
                        <div>
                            <Link to="/generate" className="navlink">
                                Generate
                            </Link>
                        </div>
                        <div>
                            <Link
                                to="/reconstruct" className="navlink">
                                Reconstruct
                            </Link>
                        </div>
                        <button className="navlink-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                ) : (
                    <nav className="headernav">
                        <div>
                            <img onClick={() => navigate('/home')} src="polygen.png" alt="Logo" className="logoimg" />
                        </div>
                    </nav>
                )}
            </header>
        </div>
    );
};

export default Header;

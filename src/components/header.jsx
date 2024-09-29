import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doSignOut } from '../auth'
import { auth } from '../firebase'

const Header = () => {
    const navigate = useNavigate()
    const userLoggedIn  = useAuth()

    const handleLogout = async () => {
        await doSignOut(auth);
        navigate('/login')
    }



    return (
        <div>
            <header className='header'>
                { userLoggedIn ? (
                <nav>
                    <Link to="/home" className='logoimg'>Logo</Link>
                    <Link to="/upload">Upload</Link>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
                ) : (
                <nav>
                    <Link to="/home" className='logoimg'>Logo</Link>
                    <Link to="/register">Sign Up</Link>
                    <Link to="/login">Login</Link>
                </nav>
                )}
            </header>
        </div>
    );
}

export default Header

{/* <nav className=''>
            {
                userLoggedIn
                    ?
                    <>
                       <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className='text-sm text-blue-600 underline'>Logout</button>
                    </>
                    :
                    <>
                        <a href="/home">Home</a>
                        <a href="/login">Login</a>
                        <a href="/register">Register</a>

                    </>
            }

        </nav> */}
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doSignOut } from '../auth'

const Header = () => {
    const navigate = useNavigate()
    // const { userLoggedIn } = useAuth()



    return (
        <div>
            <header className='header'>
                <a href="/" className='logoimg'>Logo</a>

                <nav className='navbar'>
                    <a href="/">Home</a>
                    <a href="/">Sign Up</a>
                    <a href="/">Login</a>
                    <a href="/">Contact</a>
                    
                </nav>
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
import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth, userLoggedIn } from '../context/AuthContext'
import { doCreateUserWithEmailAndPassword } from '../auth'
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../auth'

const Register = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)

    const { userLoggedIn } = useAuth()


    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isRegistering) {
            setIsRegistering(true)
            await doCreateUserWithEmailAndPassword(email, password)
        }
    }

    const onGoogleSignIn = (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            doSignInWithGoogle().catch(err => {
                setIsSigningIn(false)
            })
        }
    }

    return (

        <div className='formContainer'>
            {userLoggedIn && (<Navigate to={'/upload'} replace={true} />)}
            <div className='shape'></div> 
            {/* change these colors and shapes to like squares */}
            <div className='shape'></div>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600&display=swap" rel="stylesheet"></link>
    
            <div className='formWrapper2'>
                <form onSubmit={onSubmit}>
                    <h3 className='logo'>Create a New Account</h3>
                    <div>
                        <label className='formlabel'>Email</label>
                        <input 
                        type="email" 
                        autoComplete='email' 
                        required 
                        value={email} onChange={(e) => {setEmail(e.target.value)}} 
                        className='formbox'/>
                    </div>

                    <div>
                        <label className='formlabel'>Password</label>
                        <input 
                        type="password" 
                        autoComplete='new-password' 
                        required
                        value={password} onChange={(e) => {setPassword(e.target.value)}} 
                        className='formbox'/>
                    </div>

                    <div>
                        <label className="formlabel">
                            Confirm Password
                        </label>
                        <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='off'
                            required
                            value={confirmPassword} onChange={(e) => { setconfirmPassword(e.target.value) }}
                            className="formbox"
                        />
                    </div>

                    {errorMessage && (
                            <span className=''>{errorMessage}</span>    
                    )}

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className={` ${isRegistering ? '' : ''}`}
                        >
                        {isRegistering ? 'Signing In...' : 'Sign In'}
                    </button>

                </form>

                <p className="smalltext">Already have an account? {'   '}<Link to={'/login'} className="">Log In</Link></p>

                <button
                        disabled={isRegistering}
                        onClick={(e) => { onGoogleSignIn(e) }}
                        className={`google-signin-btn ${isRegistering ? '' : ''}`}>
                        <svg className="google-signin-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">

                            <g clipPath="url(#clip0_17_40)">
                                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                            </g>

                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="48" height="48" fill="white" />
                                </clipPath>
                            </defs>

                        </svg>

                        {isSigningIn ? 'Signing Up...' : 'Sign Up'}
                    </button>
            </div>
        </div>
    )

    // {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

        //     <main className="formContainer">
        //         <div className="formWrapper">
        //             <div className="text-center mb-6">
        //                 <div className="mt-2">
        //                     <h3 className="logo">Create a New Account</h3>
        //                 </div>

        //             </div>
        //             <form
        //                 onSubmit={onSubmit}
        //                 className="space-y-4"
        //             >
        //                 <div>
        //                     <label className="text-sm text-gray-600 font-bold">
        //                         Email
        //                     </label>
        //                     <input
        //                         type="email"
        //                         autoComplete='email'
        //                         required
        //                         value={email} onChange={(e) => { setEmail(e.target.value) }}
        //                         className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
        //                     />
        //                 </div>

        //                 <div>
        //                     <label className="text-sm text-gray-600 font-bold">
        //                         Password
        //                     </label>
        //                     <input
        //                         disabled={isRegistering}
        //                         type="password"
        //                         autoComplete='new-password'
        //                         required
        //                         value={password} onChange={(e) => { setPassword(e.target.value) }}
        //                         className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
        //                     />
        //                 </div>

        //                 <div>
        //                     <label className="text-sm text-gray-600 font-bold">
        //                         Confirm Password
        //                     </label>
        //                     <input
        //                         disabled={isRegistering}
        //                         type="password"
        //                         autoComplete='off'
        //                         required
        //                         value={confirmPassword} onChange={(e) => { setconfirmPassword(e.target.value) }}
        //                         className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
        //                     />
        //                 </div>

        //                 {errorMessage && (
        //                     <span className='text-red-600 font-bold'>{errorMessage}</span>
        //                 )}

        //                 <button
        //                     type="submit"
        //                     disabled={isRegistering}
        //                     className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
        //                 >
        //                     {isRegistering ? 'Signing Up...' : 'Sign Up'}
        //                 </button>
        //                 <div className="text-sm text-center">
        //                     Already have an account? {'   '}
        //                     <Link to={'/login'} className="text-center text-sm hover:underline font-bold">Continue</Link>
        //                 </div>
        //             </form>
        //         </div>
        //     </main>
}

export default Register
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { div } from 'three/webgpu'

const Home = () => {
    const { currentUser } = useAuth()
    return (
        <div className='formContainer'>
            <div className='blob'/>
        </div>
        // <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
    )
}

export default Home
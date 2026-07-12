import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { FaEye, FaEyeSlash } from "react-icons/fa"

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const { loading, handleRegister } = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleRegister({ username, email, password })
        if (success) navigate("/")
    }

    if (loading) {
        return (
            <main className="global-loader">
                <FaCircleNotch className="spinner" size={50} />
                <h2>Creating Account...</h2>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <div className="form-header">
                    <h1>Create Account</h1>
                    <p>Join us to start generating interview strategies</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <input
                                onChange={(e) => { setUsername(e.target.value) }}
                                type="text" 
                                id="username" 
                                name='username' 
                                placeholder='Choose a username' 
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <input
                                onChange={(e) => { setEmail(e.target.value) }}
                                type="email" 
                                id="email" 
                                name='email' 
                                placeholder='Enter your email address' 
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper has-toggle">
                            <input
                                onChange={(e) => { setPassword(e.target.value) }}
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                name='password' 
                                placeholder='Create a password' 
                                required
                            />
                            <span 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)} 
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <button className='button primary-button' type="submit">Register</button>
                </form>

                <div className="form-footer">
                    <p>Already have an account? <Link to={"/login"}>Login</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Register
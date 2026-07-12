import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { FaEye, FaEyeSlash } from "react-icons/fa"

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleLogin({ email, password })
        if (success) navigate('/')
    }

    if (loading) {
        return (
            <main className="global-loader">
                <FaCircleNotch className="spinner" size={50} />
                <h2>Authenticating...</h2>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <div className="form-header">
                    <h1>Welcome Back</h1>
                    <p>Log in to continue to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                                placeholder='Enter your password' 
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

                    <button className='button primary-button' type="submit">Login</button>
                </form>

                <div className="form-footer">
                    <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login
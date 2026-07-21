import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { FaEye, FaEyeSlash, FaCircleNotch } from "react-icons/fa"
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {
    const { loading, handleLogin, handleGoogleAuth } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [emailError, setEmailError] = useState("")
    const [authError, setAuthError] = useState("")

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setAuthError("")
        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email")
            return
        }
        setEmailError("")
        const result = await handleLogin({ email, password })
        if (result.success) {
            navigate('/dashboard')
        } else {
            setAuthError(result.message)
        }
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

                {authError && (
                    <div className="auth-error">
                        <span className="auth-error__icon">⚠️</span>
                        <span>{authError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <input
                                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); if (authError) setAuthError("") }}
                                type="text" 
                                id="email" 
                                name='email' 
                                value={email}
                                placeholder='Enter your email address' 
                                required
                                className={emailError ? 'input-error' : ''}
                            />
                        </div>
                        {emailError && <span className="error-message">{emailError}</span>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper has-toggle">
                            <input
                                onChange={(e) => { setPassword(e.target.value); if (authError) setAuthError("") }}
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                name='password' 
                                value={password}
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

                    <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#ff2d78', textDecoration: 'none' }}>Forgot Password?</Link>
                    </div>

                    <button className='button primary-button' type="submit">Login</button>
                </form>

                <div className="or-divider" style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#7d8590', fontSize: '0.75rem' }}>
                    <span style={{ flex: 1, height: '1px', backgroundColor: '#2a3348' }}></span>
                    <span style={{ whiteSpace: 'nowrap' }}>OR</span>
                    <span style={{ flex: 1, height: '1px', backgroundColor: '#2a3348' }}></span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin 
                        onSuccess={async (credentialResponse) => {
                            const result = await handleGoogleAuth(credentialResponse.credential);
                            if (result.success) {
                                navigate('/dashboard')
                            } else {
                                setAuthError(result.message)
                            }
                        }}
                        onError={() => {
                            setAuthError("Google Login Failed");
                        }}
                        theme="filled_black"
                        size="large"
                    />
                </div>

                <div className="form-footer" style={{ marginTop: '1.5rem' }}>
                    <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login
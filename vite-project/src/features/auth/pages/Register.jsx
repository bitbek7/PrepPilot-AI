import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { FaEye, FaEyeSlash, FaCircleNotch, FaCheck, FaTimes } from "react-icons/fa"
import { GoogleLogin } from '@react-oauth/google'

// ── Password strength rules ────────────────────────────────────────────────
const PASSWORD_RULES = [
    { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'One special character (!@#$...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

const Register = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: details, 2: otp
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [otp, setOtp] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [emailError, setEmailError] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [authError, setAuthError] = useState("")
    const [infoMessage, setInfoMessage] = useState("")

    const { loading, handleRegister, handleSendOtp, handleGoogleAuth } = useAuth()

    // ── Derived state ────────────────────────────────────────────────────────
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

    const validateUsername = (value) => {
        if (value.length < 3) return "Username must be at least 3 characters"
        if (value.length > 20) return "Username must be under 20 characters"
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores"
        return ""
    }

    const passedRules = useMemo(() => PASSWORD_RULES.filter(r => r.test(password)), [password])
    const strengthPercent = password.length === 0 ? 0 : (passedRules.length / PASSWORD_RULES.length) * 100
    const strengthLabel = strengthPercent <= 20 ? 'Very Weak' : strengthPercent <= 40 ? 'Weak' : strengthPercent <= 60 ? 'Fair' : strengthPercent <= 80 ? 'Strong' : 'Very Strong'
    const strengthColor = strengthPercent <= 20 ? '#ff4757' : strengthPercent <= 40 ? '#ff6b6b' : strengthPercent <= 60 ? '#ffa502' : strengthPercent <= 80 ? '#2ed573' : '#7bed9f'

    const allPasswordRulesPassed = passedRules.length === PASSWORD_RULES.length
    const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword
    const formIsValid = username.length >= 3 && validateEmail(email) && allPasswordRulesPassed && passwordsMatch

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSendCode = async (e) => {
        e.preventDefault()
        setAuthError("")
        setInfoMessage("")

        const usernameErr = validateUsername(username)
        if (usernameErr) { setUsernameError(usernameErr); return }
        setUsernameError("")

        if (!validateEmail(email)) { setEmailError("Please enter a valid email address"); return }
        setEmailError("")

        if (!allPasswordRulesPassed) { setPasswordError("Password does not meet all requirements"); return }
        setPasswordError("")

        if (!passwordsMatch) { setPasswordError("Passwords do not match"); return }
        setPasswordError("")

        const result = await handleSendOtp({ username, email })
        if (result.success) {
            setStep(2)
            setInfoMessage(`Verification code sent to ${email}`)
        } else {
            setAuthError(result.message)
        }
    }

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault()
        setAuthError("")
        if (!otp || otp.length !== 6) {
            setAuthError("Please enter a valid 6-digit verification code")
            return
        }
        const result = await handleRegister({ username, email, password, otp })
        if (result.success) {
            navigate("/dashboard")
        } else {
            setAuthError(result.message)
        }
    }

    const handleResendCode = async () => {
        setAuthError("")
        setInfoMessage("")
        const result = await handleSendOtp({ username, email })
        if (result.success) {
            setInfoMessage("New verification code sent!")
        } else {
            setAuthError(result.message)
        }
    }

    // ── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="global-loader">
                <FaCircleNotch className="spinner" size={50} />
                <h2>{step === 1 ? 'Sending Verification Code...' : 'Creating Your Account...'}</h2>
            </main>
        )
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <main>
            <div className="form-container" style={{ maxWidth: step === 1 ? '460px' : '420px' }}>

                {/* Step Indicator */}
                <div className="register-steps">
                    <div className={`register-steps__item ${step >= 1 ? 'register-steps__item--active' : ''}`}>
                        <span className="register-steps__number">1</span>
                        <span className="register-steps__label">Details</span>
                    </div>
                    <div className="register-steps__line" style={{ backgroundColor: step >= 2 ? '#ff2d78' : '#2a3348' }} />
                    <div className={`register-steps__item ${step >= 2 ? 'register-steps__item--active' : ''}`}>
                        <span className="register-steps__number">2</span>
                        <span className="register-steps__label">Verify</span>
                    </div>
                </div>

                <div className="form-header">
                    <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
                    <p>{step === 1 ? 'Fill in your details to get started' : `Enter the 6-digit code sent to ${email}`}</p>
                </div>

                {/* ── Alerts ── */}
                {authError && (
                    <div className="auth-error">
                        <span className="auth-error__icon">⚠️</span>
                        <span>{authError}</span>
                    </div>
                )}
                {infoMessage && (
                    <div className="auth-error" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
                        <span className="auth-error__icon">✅</span>
                        <span>{infoMessage}</span>
                    </div>
                )}

                {/* ════════════ STEP 1: Details ════════════ */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} noValidate>
                        {/* Username */}
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-wrapper">
                                <input
                                    onChange={(e) => { setUsername(e.target.value); setUsernameError(""); setAuthError("") }}
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={username}
                                    placeholder="letters, numbers, underscores only"
                                    required
                                    autoComplete="username"
                                    className={usernameError ? 'input-error' : ''}
                                />
                            </div>
                            {usernameError && <span className="error-message">{usernameError}</span>}
                            {!usernameError && username.length >= 3 && (
                                <span className="success-hint"><FaCheck size={10} /> Username looks good</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); setAuthError("") }}
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    className={emailError ? 'input-error' : ''}
                                />
                            </div>
                            {emailError && <span className="error-message">{emailError}</span>}
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper has-toggle">
                                <input
                                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); setAuthError("") }}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={password}
                                    placeholder="Create a strong password"
                                    required
                                    autoComplete="new-password"
                                />
                                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Hide" : "Show"}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            {/* Strength Meter */}
                            {password.length > 0 && (
                                <div className="password-strength">
                                    <div className="password-strength__bar">
                                        <div className="password-strength__fill" style={{ width: `${strengthPercent}%`, backgroundColor: strengthColor }} />
                                    </div>
                                    <span className="password-strength__label" style={{ color: strengthColor }}>{strengthLabel}</span>
                                </div>
                            )}

                            {/* Rule checklist */}
                            {password.length > 0 && (
                                <ul className="password-rules">
                                    {PASSWORD_RULES.map(rule => {
                                        const passed = rule.test(password)
                                        return (
                                            <li key={rule.id} className={`password-rules__item ${passed ? 'password-rules__item--pass' : ''}`}>
                                                {passed ? <FaCheck size={10} /> : <FaTimes size={10} />}
                                                <span>{rule.label}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}

                            {passwordError && <span className="error-message">{passwordError}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper has-toggle">
                                <input
                                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); setAuthError("") }}
                                    type={showConfirm ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    placeholder="Re-enter your password"
                                    required
                                    autoComplete="new-password"
                                    className={confirmPassword.length > 0 && !passwordsMatch ? 'input-error' : ''}
                                />
                                <span className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} title={showConfirm ? "Hide" : "Show"}>
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <span className="error-message">Passwords do not match</span>
                            )}
                            {passwordsMatch && (
                                <span className="success-hint"><FaCheck size={10} /> Passwords match</span>
                            )}
                        </div>

                        <button
                            className='button primary-button'
                            type="submit"
                            disabled={!formIsValid}
                            style={{ opacity: formIsValid ? 1 : 0.5, cursor: formIsValid ? 'pointer' : 'not-allowed' }}
                        >
                            Send Verification Code
                        </button>

                        {/* OR Divider */}
                        <div className="register-divider">
                            <span className="register-divider__line" />
                            <span className="register-divider__text">OR</span>
                            <span className="register-divider__line" />
                        </div>

                        {/* Google Login */}
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
                                onError={() => setAuthError("Google Login Failed")}
                                theme="filled_black"
                                size="large"
                            />
                        </div>
                    </form>
                )}

                {/* ════════════ STEP 2: OTP Verification ════════════ */}
                {step === 2 && (
                    <form onSubmit={handleVerifyAndRegister}>
                        <div className="input-group">
                            <label htmlFor="otp">6-Digit Verification Code</label>
                            <div className="input-wrapper">
                                <input
                                    onChange={(e) => { 
                                        const val = e.target.value.replace(/[^0-9]/g, '')
                                        setOtp(val)
                                        setAuthError("") 
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    placeholder="000000"
                                    maxLength="6"
                                    required
                                    autoComplete="one-time-code"
                                    style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', fontWeight: '600' }}
                                />
                            </div>
                        </div>

                        <button className='button primary-button' type="submit" disabled={otp.length !== 6} style={{ opacity: otp.length === 6 ? 1 : 0.5, cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>
                            Verify & Create Account
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <button className="text-link-btn" type="button" onClick={() => { setStep(1); setInfoMessage(""); setOtp("") }}>
                                ← Back
                            </button>
                            <button className="text-link-btn" type="button" onClick={handleResendCode}>
                                Resend Code
                            </button>
                        </div>
                    </form>
                )}

                <div className="form-footer" style={{ marginTop: '1rem' }}>
                    <p>Already have an account? <Link to={"/login"}>Login</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Register
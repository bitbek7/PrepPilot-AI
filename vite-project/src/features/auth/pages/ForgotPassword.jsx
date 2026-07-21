import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { FaEye, FaEyeSlash, FaCircleNotch, FaCheck, FaTimes } from "react-icons/fa"
import { forgotPassword, verifyResetOtp, resetPassword } from '../services/auth.api'

const PASSWORD_RULES = [
    { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'One special character (!@#$...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: email, 2: otp, 3: new password
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [resetToken, setResetToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState("")
    const [infoMessage, setInfoMessage] = useState("")

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

    const passedRules = useMemo(() => PASSWORD_RULES.filter(r => r.test(newPassword)), [newPassword])
    const strengthPercent = newPassword.length === 0 ? 0 : (passedRules.length / PASSWORD_RULES.length) * 100
    const strengthLabel = strengthPercent <= 20 ? 'Very Weak' : strengthPercent <= 40 ? 'Weak' : strengthPercent <= 60 ? 'Fair' : strengthPercent <= 80 ? 'Strong' : 'Very Strong'
    const strengthColor = strengthPercent <= 20 ? '#ff4757' : strengthPercent <= 40 ? '#ff6b6b' : strengthPercent <= 60 ? '#ffa502' : strengthPercent <= 80 ? '#2ed573' : '#7bed9f'
    const allPasswordRulesPassed = passedRules.length === PASSWORD_RULES.length
    const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword

    // ── Step 1: Send OTP ──
    const handleSendCode = async (e) => {
        e.preventDefault()
        if (loading) return;
        setAuthError("")
        setInfoMessage("")
        if (!validateEmail(email)) {
            setAuthError("Please enter a valid email address")
            return
        }
        setLoading(true)
        try {
            await forgotPassword({ email })
            setStep(2)
            setInfoMessage(`Verification code sent to ${email}`)
        } catch (err) {
            setAuthError(err.response?.data?.message || "Failed to send verification code")
        } finally {
            setLoading(false)
        }
    }

    // ── Step 2: Verify OTP ──
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        if (loading) return;
        setAuthError("")
        setInfoMessage("")
        if (!otp || otp.length !== 6) {
            setAuthError("Please enter a valid 6-digit verification code")
            return
        }
        setLoading(true)
        try {
            const data = await verifyResetOtp({ email, otp })
            setResetToken(data.resetToken)
            setStep(3)
            setInfoMessage("Code verified! Set your new password.")
        } catch (err) {
            setAuthError(err.response?.data?.message || "Invalid or expired verification code")
        } finally {
            setLoading(false)
        }
    }

    // ── Step 3: Reset Password ──
    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (loading) return;
        setAuthError("")
        setInfoMessage("")
        if (!allPasswordRulesPassed) {
            setAuthError("Password does not meet all requirements")
            return
        }
        if (!passwordsMatch) {
            setAuthError("Passwords do not match")
            return
        }
        setLoading(true)
        try {
            await resetPassword({ resetToken, newPassword })
            setInfoMessage("Password reset successfully! Redirecting to login...")
            setTimeout(() => navigate("/login"), 2000)
        } catch (err) {
            setAuthError(err.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (loading) return;
        setAuthError("")
        setInfoMessage("")
        setLoading(true)
        try {
            await forgotPassword({ email })
            setInfoMessage("New verification code sent!")
        } catch (err) {
            setAuthError(err.response?.data?.message || "Failed to resend code")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="global-loader">
                <FaCircleNotch className="spinner" size={50} />
                <h2>{step === 1 ? 'Sending Code...' : step === 2 ? 'Verifying...' : 'Resetting Password...'}</h2>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container" style={{ maxWidth: '420px' }}>

                {/* Step Indicator */}
                <div className="register-steps">
                    <div className={`register-steps__item ${step >= 1 ? 'register-steps__item--active' : ''}`}>
                        <span className="register-steps__number">1</span>
                        <span className="register-steps__label">Email</span>
                    </div>
                    <div className="register-steps__line" style={{ backgroundColor: step >= 2 ? '#ff2d78' : '#2a3348' }} />
                    <div className={`register-steps__item ${step >= 2 ? 'register-steps__item--active' : ''}`}>
                        <span className="register-steps__number">2</span>
                        <span className="register-steps__label">Verify</span>
                    </div>
                    <div className="register-steps__line" style={{ backgroundColor: step >= 3 ? '#ff2d78' : '#2a3348' }} />
                    <div className={`register-steps__item ${step >= 3 ? 'register-steps__item--active' : ''}`}>
                        <span className="register-steps__number">3</span>
                        <span className="register-steps__label">Reset</span>
                    </div>
                </div>

                <div className="form-header">
                    <h1>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Email' : 'New Password'}</h1>
                    <p>{step === 1 ? 'Enter your email to receive a verification code' : step === 2 ? `Enter the 6-digit code sent to ${email}` : 'Create a new password for your account'}</p>
                </div>

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

                {/* ════════════ STEP 1: Email ════════════ */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} noValidate>
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    onChange={(e) => { setEmail(e.target.value); setAuthError("") }}
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    placeholder="Enter your registered email"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <button
                            className='button primary-button'
                            type="submit"
                            disabled={!validateEmail(email)}
                            style={{ opacity: validateEmail(email) ? 1 : 0.5, cursor: validateEmail(email) ? 'pointer' : 'not-allowed' }}
                        >
                            Send Verification Code
                        </button>
                    </form>
                )}

                {/* ════════════ STEP 2: OTP ════════════ */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
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
                            Verify Code
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

                {/* ════════════ STEP 3: New Password ════════════ */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} noValidate>
                        <div className="input-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="input-wrapper has-toggle">
                                <input
                                    onChange={(e) => { setNewPassword(e.target.value); setAuthError("") }}
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={newPassword}
                                    placeholder="Create a strong password"
                                    required
                                    autoComplete="new-password"
                                />
                                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Hide" : "Show"}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            {newPassword.length > 0 && (
                                <div className="password-strength">
                                    <div className="password-strength__bar">
                                        <div className="password-strength__fill" style={{ width: `${strengthPercent}%`, backgroundColor: strengthColor }} />
                                    </div>
                                    <span className="password-strength__label" style={{ color: strengthColor }}>{strengthLabel}</span>
                                </div>
                            )}

                            {newPassword.length > 0 && (
                                <ul className="password-rules">
                                    {PASSWORD_RULES.map(rule => {
                                        const passed = rule.test(newPassword)
                                        return (
                                            <li key={rule.id} className={`password-rules__item ${passed ? 'password-rules__item--pass' : ''}`}>
                                                {passed ? <FaCheck size={10} /> : <FaTimes size={10} />}
                                                <span>{rule.label}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="input-wrapper has-toggle">
                                <input
                                    onChange={(e) => { setConfirmPassword(e.target.value); setAuthError("") }}
                                    type={showConfirm ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    placeholder="Re-enter your new password"
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
                            disabled={!allPasswordRulesPassed || !passwordsMatch}
                            style={{ opacity: allPasswordRulesPassed && passwordsMatch ? 1 : 0.5, cursor: allPasswordRulesPassed && passwordsMatch ? 'pointer' : 'not-allowed' }}
                        >
                            Reset Password
                        </button>
                    </form>
                )}

                <div className="form-footer" style={{ marginTop: '1rem' }}>
                    <p>Remember your password? <Link to={"/login"}>Login</Link></p>
                </div>
            </div>
        </main>
    )
}

export default ForgotPassword

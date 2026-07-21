import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, sendOtp, googleAuth } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: "Login failed. Please try again." }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || "Invalid email or password"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleSendOtp = async ({ username, email }) => {
        setLoading(true)
        try {
            await sendOtp({ username, email })
            return { success: true }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || "Failed to send OTP."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password, otp }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password, otp })
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: "Registration failed. Please try again." }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || "Registration failed. Please try again."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async (credential) => {
        setLoading(true)
        try {
            const data = await googleAuth(credential)
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: "Google login failed." }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || "Google login failed."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleSendOtp, handleRegister, handleLogin, handleLogout, handleGoogleAuth }
}

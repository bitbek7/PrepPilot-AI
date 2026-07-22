import axios from "axios"


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
    withCredentials: true
})

export async function sendOtp({ username, email }) {
    const response = await api.post('/api/auth/send-otp', {
        username, email
    })
    return response.data
}

export async function register({ username, email, password, otp }) {
    const response = await api.post('/api/auth/register', {
        username, email, password, otp
    })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email, password
    })
    return response.data
}

export async function logout() {
    const response = await api.get("/api/auth/logout")
    return response.data
}

export async function googleAuth(credential) {
    const response = await api.post("/api/auth/google", {
        credential
    })
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function forgotPassword({ email }) {
    const response = await api.post("/api/auth/forgot-password", { email })
    return response.data
}

export async function verifyResetOtp({ email, otp }) {
    const response = await api.post("/api/auth/verify-reset-otp", { email, otp })
    return response.data
}

export async function resetPassword({ resetToken, newPassword }) {
    const response = await api.post("/api/auth/reset-password", { resetToken, newPassword })
    return response.data
}
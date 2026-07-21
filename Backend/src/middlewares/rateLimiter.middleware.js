const rateLimit = require("express-rate-limit")

/**
 * Rate limiter for login attempts.
 * 5 attempts per 15 minutes per IP.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

/**
 * Rate limiter for OTP sending (registration + forgot password).
 * 3 attempts per 15 minutes per IP.
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: { message: "Too many OTP requests. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

/**
 * Rate limiter for password reset.
 * 5 attempts per 15 minutes per IP.
 */
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: "Too many password reset attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = { loginLimiter, otpLimiter, resetPasswordLimiter, generalLimiter }

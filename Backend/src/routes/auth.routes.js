const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { loginLimiter, otpLimiter, resetPasswordLimiter } = require("../middlewares/rateLimiter.middleware")

const authRouter = Router()

/**
 * @route POST /api/auth/send-otp
 * @description Send OTP to user email
 * @access Public
 */
authRouter.post("/send-otp", otpLimiter, authController.sendOtpController)

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", loginLimiter, authController.loginUserController)

/**
 * @route POST /api/auth/google
 * @description login/register user with Google OAuth
 * @access Public
 */
authRouter.post("/google", loginLimiter, authController.googleAuthController)

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

/**
 * @route POST /api/auth/forgot-password
 * @description send OTP to user email for password reset
 * @access Public
 */
authRouter.post("/forgot-password", otpLimiter, authController.forgotPasswordController)

/**
 * @route POST /api/auth/verify-reset-otp
 * @description verify the OTP sent for password reset
 * @access Public
 */
authRouter.post("/verify-reset-otp", resetPasswordLimiter, authController.verifyResetOtpController)

/**
 * @route POST /api/auth/reset-password
 * @description reset user password after OTP verification
 * @access Public
 */
authRouter.post("/reset-password", resetPasswordLimiter, authController.resetPasswordController)


module.exports = authRouter
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const otpModel = require("../models/otp.model")
const { sendOtpEmail, sendWelcomeEmail } = require("../services/email.service")
const { OAuth2Client } = require('google-auth-library');
const { z } = require('zod');

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// ── Cookie options helper ────────────────────────────────────────────────────
function getCookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000
    }
}

// ── Validation schemas ─────────────────────────────────────────────────────
const usernameSchema = z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be under 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

const emailSchema = z.string().email("Please provide a valid email address");

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character");

const registerInputSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    otp: z.string().length(6, "OTP must be exactly 6 digits")
});

const sendOtpInputSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
});

const loginInputSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

/**
 * @name sendOtpController
 * @description send an OTP to the user's email after validating input
 * @access Public
 */
async function sendOtpController(req, res) {
    try {
        const parsed = sendOtpInputSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0]?.message || "Invalid input";
            return res.status(400).json({ message: firstError });
        }
        const { email, username } = parsed.data;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save hashed OTP to database (upsert if exists)
        await otpModel.findOneAndUpdate(
            { email },
            { otp: hashedOtp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send plaintext OTP via email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email, password, and otp in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const parsed = registerInputSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0]?.message || "Invalid input";
            return res.status(400).json({ message: firstError });
        }
        const { username, email, password, otp } = parsed.data;

        // Verify OTP — find the record then compare with bcrypt
        const otpRecord = await otpModel.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash,
            authProvider: 'local'
        })

        // Delete the OTP after successful registration
        await otpModel.deleteOne({ email });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        // Validate login input with Zod
        const parsed = loginInputSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0]?.message || "Invalid input";
            return res.status(400).json({ message: firstError });
        }
        const { email, password } = parsed.data;

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        if (!user.password) {
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please login with Google."
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())
        res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name googleAuthController
 * @description login/register user using Google OAuth
 * @access Public
 */
async function googleAuthController(req, res) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
        });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            // Check if username is taken
            let username = name.replace(/\s+/g, '').toLowerCase();
            const existingUsername = await userModel.findOne({ username });
            if (existingUsername) {
                username = `${username}${Math.floor(Math.random() * 10000)}`;
            }

            user = await userModel.create({
                username,
                email,
                authProvider: 'google'
            });

            // Send welcome email asynchronously
            sendWelcomeEmail(email, user.username).catch(err => console.error("Failed to send welcome email:", err));
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, getCookieOptions());

        res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error during Google Auth" });
    }
}

/**
 * @name forgotPasswordController
 * @description send an OTP to the user's email for password reset
 * @access Public
 */
async function forgotPasswordController(req, res) {
    try {
        const parsed = emailSchema.safeParse(req.body.email);
        if (!parsed.success) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }
        const email = parsed.data;

        const user = await userModel.findOne({ email });

        // Always return success to prevent user enumeration
        // But only actually send OTP if user exists and is not a Google user
        if (!user || user.authProvider === 'google') {
            return res.status(200).json({ message: "If an account exists with this email, a password reset code has been sent." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing
        const hashedOtp = await bcrypt.hash(otp, 10);

        await otpModel.findOneAndUpdate(
            { email },
            { otp: hashedOtp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "If an account exists with this email, a password reset code has been sent." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @name verifyResetOtpController
 * @description verify the OTP sent for password reset, issues a short-lived reset token
 * @access Public
 */
async function verifyResetOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp || otp.length !== 6) {
            return res.status(400).json({ message: "Please provide a valid email and 6-digit code" });
        }

        const otpRecord = await otpModel.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        // Delete the OTP to prevent reuse
        await otpModel.deleteOne({ email });

        // Issue a short-lived signed reset token (10 minutes)
        const resetToken = jwt.sign(
            { email, purpose: "password-reset" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        res.status(200).json({
            message: "Verification code verified successfully",
            resetToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @name resetPasswordController
 * @description reset the user's password using a signed reset token
 * @access Public
 */
async function resetPasswordController(req, res) {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate new password
        const parsed = passwordSchema.safeParse(newPassword);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0]?.message || "Invalid password";
            return res.status(400).json({ message: firstError });
        }

        // Verify the reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (tokenErr) {
            return res.status(400).json({ message: "Reset token is invalid or expired. Please request a new verification code." });
        }

        if (decoded.purpose !== "password-reset" || !decoded.email) {
            return res.status(400).json({ message: "Invalid reset token" });
        }

        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({ message: "No account found with this email address" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = {
    sendOtpController,
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleAuthController,
    forgotPasswordController,
    verifyResetOtpController,
    resetPasswordController
}
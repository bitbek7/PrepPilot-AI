const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendOtpEmail(to, otp) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials not configured. OTP generated is:", otp);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: "Your Verification Code - PrepPilot",
        text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #ff2d78; text-align: center;">Welcome to PrepPilot!</h2>
                <p style="font-size: 16px; color: #333;">To complete your registration, please use the following verification code:</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #666;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this code, you can safely ignore this email.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

async function sendWelcomeEmail(to, name) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials not configured. Welcome email not sent to:", to);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: "Welcome to PrepPilot AI!",
        text: `Hi ${name},\n\nYou have successfully registered for PrepPilot AI. We're excited to help you prepare for your interviews!\n\nBest regards,\nThe PrepPilot Team`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #ff2d78; text-align: center;">Welcome to PrepPilot AI, ${name}! 🎉</h2>
                <p style="font-size: 16px; color: #333;">You have successfully registered for PrepPilot AI.</p>
                <p style="font-size: 16px; color: #333;">We're thrilled to have you on board. Our AI-driven platform is designed to help you ace your interviews and build confidence.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/dashboard" style="background-color: #ff2d78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Best regards,<br>The PrepPilot Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendOtpEmail,
    sendWelcomeEmail
};

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Document will automatically delete 5 minutes after creation
    }
});

const otpModel = mongoose.model("otp", otpSchema);

module.exports = otpModel;

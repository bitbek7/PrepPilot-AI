const mongoose = require("mongoose");

const bugReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Bug report title is required"],
        trim: true,
        maxlength: [200, "Title must be under 200 characters"]
    },
    description: {
        type: String,
        required: [true, "Bug description is required"],
        trim: true,
        maxlength: [5000, "Description must be under 5000 characters"]
    },
    category: {
        type: String,
        enum: ["ui", "performance", "auth", "interview", "other"],
        required: [true, "Category is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        required: [true, "Severity is required"]
    },
    stepsToReproduce: {
        type: String,
        trim: true,
        maxlength: [3000, "Steps to reproduce must be under 3000 characters"]
    },
    expectedBehavior: {
        type: String,
        trim: true,
        maxlength: [2000, "Expected behavior must be under 2000 characters"]
    },
    actualBehavior: {
        type: String,
        trim: true,
        maxlength: [2000, "Actual behavior must be under 2000 characters"]
    },
    browserInfo: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "resolved", "closed"],
        default: "open"
    },
    adminNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const bugReportModel = mongoose.model("BugReport", bugReportSchema);

module.exports = bugReportModel;

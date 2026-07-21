const bugReportModel = require("../models/bugReport.model");
const { z } = require("zod");

// ── Validation schema ─────────────────────────────────────────────────────
const bugReportInputSchema = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters")
        .max(200, "Title must be under 200 characters"),
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(5000, "Description must be under 5000 characters"),
    category: z.enum(["ui", "performance", "auth", "interview", "other"], {
        errorMap: () => ({ message: "Please select a valid category" })
    }),
    severity: z.enum(["low", "medium", "high", "critical"], {
        errorMap: () => ({ message: "Please select a valid severity" })
    }),
    stepsToReproduce: z.string().max(3000).optional().default(""),
    expectedBehavior: z.string().max(2000).optional().default(""),
    actualBehavior: z.string().max(2000).optional().default(""),
    browserInfo: z.string().optional().default(""),
});

/**
 * @name submitBugReportController
 * @description Submit a new bug report (authenticated users only)
 * @access Private
 */
async function submitBugReportController(req, res) {
    try {
        const parsed = bugReportInputSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0]?.message || "Invalid input";
            return res.status(400).json({ message: firstError });
        }

        const bugReport = await bugReportModel.create({
            ...parsed.data,
            user: req.user.id
        });

        res.status(201).json({
            message: "Bug report submitted successfully",
            bugReport: {
                id: bugReport._id,
                title: bugReport.title,
                category: bugReport.category,
                severity: bugReport.severity,
                status: bugReport.status,
                createdAt: bugReport.createdAt
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @name getUserBugReportsController
 * @description Get all bug reports submitted by the logged-in user
 * @access Private
 */
async function getUserBugReportsController(req, res) {
    try {
        const bugReports = await bugReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("title category severity status createdAt");

        res.status(200).json({
            message: "Bug reports fetched successfully",
            bugReports
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @name getBugReportByIdController
 * @description Get a single bug report by ID (ownership check)
 * @access Private
 */
async function getBugReportByIdController(req, res) {
    try {
        const { bugId } = req.params;

        const bugReport = await bugReportModel.findOne({
            _id: bugId,
            user: req.user.id
        });

        if (!bugReport) {
            return res.status(404).json({ message: "Bug report not found" });
        }

        res.status(200).json({
            message: "Bug report fetched successfully",
            bugReport
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    submitBugReportController,
    getUserBugReportsController,
    getBugReportByIdController
};

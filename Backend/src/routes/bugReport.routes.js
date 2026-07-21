const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const bugReportController = require("../controllers/bugReport.controller");
const { generalLimiter } = require("../middlewares/rateLimiter.middleware");

const bugReportRouter = express.Router();

/**
 * @route POST /api/bugs
 * @description Submit a new bug report
 * @access Private
 */
bugReportRouter.post("/", authMiddleware.authUser, generalLimiter, bugReportController.submitBugReportController);

/**
 * @route GET /api/bugs
 * @description Get all bug reports for the logged-in user
 * @access Private
 */
bugReportRouter.get("/", authMiddleware.authUser, bugReportController.getUserBugReportsController);

/**
 * @route GET /api/bugs/:bugId
 * @description Get a single bug report by ID
 * @access Private
 */
bugReportRouter.get("/:bugId", authMiddleware.authUser, bugReportController.getBugReportByIdController);

module.exports = bugReportRouter;

const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const app = express()
const authRouter = require("./routes/auth.routes.js")
const interviewRouter = require("./routes/interview.routes")
const bugReportRouter = require("./routes/bugReport.routes")
const { generalLimiter } = require("./middlewares/rateLimiter.middleware")

// Security headers
app.use(helmet())

// Rate limiting
app.use(generalLimiter)

app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/bugs", bugReportRouter)

// Global error handler — prevents stack trace leaks
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message || "Internal server error"
    })
})

module.exports = app
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { FaCircleNotch } from "react-icons/fa";
import { submitBugReport, getUserBugReports } from "../services/bugReport.api";
import "../bugReport.scss";

const CATEGORIES = [
    { value: "", label: "Select a category" },
    { value: "ui", label: "UI / Visual" },
    { value: "performance", label: "Performance" },
    { value: "auth", label: "Authentication" },
    { value: "interview", label: "Interview Reports" },
    { value: "other", label: "Other" },
];

const SEVERITIES = [
    { value: "", label: "Select severity" },
    { value: "low", label: "Low — Minor issue" },
    { value: "medium", label: "Medium — Noticeable but workaround exists" },
    { value: "high", label: "High — Major feature broken" },
    { value: "critical", label: "Critical — App unusable" },
];

const BugReport = () => {
    const [loading, setLoading] = useState(false);
    const [fetchingReports, setFetchingReports] = useState(true);
    const [reports, setReports] = useState([]);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [severity, setSeverity] = useState("");
    const [stepsToReproduce, setStepsToReproduce] = useState("");
    const [expectedBehavior, setExpectedBehavior] = useState("");
    const [actualBehavior, setActualBehavior] = useState("");

    // Fetch user's existing reports on mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getUserBugReports();
                setReports(data.bugReports || []);
            } catch (err) {
                console.error("Failed to fetch bug reports:", err);
            } finally {
                setFetchingReports(false);
            }
        };
        fetchReports();
    }, []);

    const isFormValid = title.length >= 5 && description.length >= 10 && category && severity;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || loading) return;

        setSuccessMsg("");
        setErrorMsg("");
        setLoading(true);

        try {
            const browserInfo = `${navigator.userAgent} | ${window.screen.width}x${window.screen.height} | ${window.location.href}`;

            const data = await submitBugReport({
                title,
                description,
                category,
                severity,
                stepsToReproduce,
                expectedBehavior,
                actualBehavior,
                browserInfo,
            });

            setSuccessMsg("Bug report submitted successfully! Thank you for helping us improve.");

            // Add new report to the list
            if (data.bugReport) {
                setReports((prev) => [data.bugReport, ...prev]);
            }

            // Reset form
            setTitle("");
            setDescription("");
            setCategory("");
            setSeverity("");
            setStepsToReproduce("");
            setExpectedBehavior("");
            setActualBehavior("");
        } catch (err) {
            const message = err.response?.data?.message || "Failed to submit bug report. Please try again.";
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bug-report-page" style={{ position: "relative" }}>
            <div className="nav-actions">
                <Link to="/dashboard" className="nav-btn">← Dashboard</Link>
            </div>

            <div className="page-header">
                <h1>🐛 Report a Bug</h1>
                <p>Found something that doesn't work right? Let us know and we'll fix it.</p>
            </div>

            <div className="bug-form-card">
                {successMsg && (
                    <div className="form-success">
                        <span>✅</span>
                        <span>{successMsg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className="form-error">
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form className="bug-form" onSubmit={handleSubmit} noValidate>
                    {/* Title */}
                    <div className="input-group">
                        <label htmlFor="bug-title">Title *</label>
                        <input
                            type="text"
                            id="bug-title"
                            placeholder="Brief summary of the issue"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setErrorMsg(""); setSuccessMsg(""); }}
                            maxLength={200}
                            required
                        />
                        {title.length > 0 && title.length < 5 && (
                            <span className="error-text">Title must be at least 5 characters</span>
                        )}
                    </div>

                    {/* Category + Severity */}
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="bug-category">Category *</label>
                            <select
                                id="bug-category"
                                value={category}
                                onChange={(e) => { setCategory(e.target.value); setErrorMsg(""); }}
                                required
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value} disabled={!c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="bug-severity">Severity *</label>
                            <select
                                id="bug-severity"
                                value={severity}
                                onChange={(e) => { setSeverity(e.target.value); setErrorMsg(""); }}
                                required
                            >
                                {SEVERITIES.map((s) => (
                                    <option key={s.value} value={s.value} disabled={!s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="input-group">
                        <label htmlFor="bug-description">Description *</label>
                        <textarea
                            id="bug-description"
                            placeholder="Describe the bug in detail..."
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setErrorMsg(""); setSuccessMsg(""); }}
                            rows={4}
                            maxLength={5000}
                            required
                        />
                        {description.length > 0 && description.length < 10 && (
                            <span className="error-text">Description must be at least 10 characters</span>
                        )}
                    </div>

                    {/* Steps to Reproduce */}
                    <div className="input-group">
                        <label htmlFor="bug-steps">Steps to Reproduce</label>
                        <textarea
                            id="bug-steps"
                            placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                            value={stepsToReproduce}
                            onChange={(e) => setStepsToReproduce(e.target.value)}
                            rows={3}
                            maxLength={3000}
                        />
                    </div>

                    {/* Expected + Actual Behavior */}
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="bug-expected">Expected Behavior</label>
                            <textarea
                                id="bug-expected"
                                placeholder="What should happen?"
                                value={expectedBehavior}
                                onChange={(e) => setExpectedBehavior(e.target.value)}
                                rows={3}
                                maxLength={2000}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="bug-actual">Actual Behavior</label>
                            <textarea
                                id="bug-actual"
                                placeholder="What actually happens?"
                                value={actualBehavior}
                                onChange={(e) => setActualBehavior(e.target.value)}
                                rows={3}
                                maxLength={2000}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <>
                                <FaCircleNotch className="spinner" size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
                                Submitting...
                            </>
                        ) : (
                            "Submit Bug Report"
                        )}
                    </button>
                </form>
            </div>

            {/* ── User's Previous Bug Reports ── */}
            <div className="bug-reports-section">
                <h2>Your Submitted Reports</h2>

                {fetchingReports ? (
                    <div className="empty-state">
                        <FaCircleNotch className="spinner" size={24} />
                        <p style={{ marginTop: "0.5rem" }}>Loading reports...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No bug reports submitted yet.</p>
                    </div>
                ) : (
                    <div className="bug-reports-list">
                        {reports.map((report) => (
                            <div key={report._id || report.id} className="bug-report-item">
                                <div className="bug-info">
                                    <div className="bug-title">{report.title}</div>
                                    <div className="bug-meta">
                                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                                <div className="bug-badges">
                                    <span className={`badge badge--category`}>{report.category}</span>
                                    <span className={`badge badge--${report.severity}`}>{report.severity}</span>
                                    <span className={`badge badge--${report.status}`}>{report.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default BugReport;

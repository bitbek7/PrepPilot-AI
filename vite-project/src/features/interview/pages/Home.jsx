import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import { FaCircleNotch } from "react-icons/fa";

const Home = () => {
    const { loading, generateReport, reports = [] } = useInterview();
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [fileName, setFileName] = useState("");
    const resumeInputRef = useRef();
    const navigate = useNavigate();

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files[0];

        // Basic validation before calling backend
        if (!jobDescription) {
            alert("Please provide a job description.");
            return;
        }

        const data = await generateReport({ jobDescription, selfDescription, resumeFile });
        if (data && data._id) {
            navigate(`/interview/${data._id}`);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    if (loading) {
        return (
            <main className="global-loader">
                <FaCircleNotch className="spinner" size={50} />
                <h2>Generating your personalized interview strategy...</h2>
            </main>
        );
    }

    return (
        <main className="home-page">
            <div className="page-header">
                <h1>Interview Strategy Generator</h1>
                <p>Provide the job description, your resume, and a brief self-description to generate a tailored interview preparation plan.</p>
            </div>

            <div className="interview-card">
                <div className="interview-card__body">

                    {/* Left Panel: Job Description */}
                    <div className="panel panel--left">
                        <div className="panel__header">
                            <div className="panel__icon">📝</div>
                            <h2>Job Description</h2>
                            <span className="badge badge--required">Required</span>
                        </div>
                        <textarea
                            className="panel__textarea"
                            name="jobDescription"
                            id="jobDescription"
                            placeholder="Paste the complete job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        ></textarea>
                        <div className="char-counter">
                            {jobDescription.length} chars
                        </div>
                    </div>

                    <div className="panel-divider"></div>

                    {/* Right Panel: Resume and Self Description */}
                    <div className="panel panel--right">
                        <div className="panel__header">
                            <div className="panel__icon">👤</div>
                            <h2>Candidate Profile</h2>
                            <span className="badge badge--best">Best Results</span>
                        </div>

                        <div className="upload-section">
                            <div className="section-label">Resume</div>
                            <label className="dropzone" htmlFor="resume" style={{ borderColor: fileName ? '#ff2d78' : '' }}>
                                <div className="dropzone__icon">📄</div>
                                <p className="dropzone__title">{fileName ? fileName : 'Upload Resume PDF'}</p>
                                <p className="dropzone__subtitle">{fileName ? 'Click to replace file' : 'Max file size: 5MB'}</p>
                            </label>
                            <input
                                ref={resumeInputRef}
                                hidden
                                type="file"
                                name="resume"
                                id="resume"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="or-divider">
                            <span>AND</span>
                        </div>

                        <div className="self-description">
                            <div className="section-label">Self Description</div>
                            <textarea
                                className="panel__textarea panel__textarea--short"
                                name="selfDescription"
                                id="selfDescription"
                                placeholder="Briefly describe your current role, key strengths, and what you're looking for..."
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="interview-card__footer">
                    <div className="info-box">
                        <div className="info-box__icon">💡</div>
                        <p><strong>Pro Tip:</strong> Providing both a resume and a self-description yields the most accurate and personalized interview strategy.</p>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        className="generate-btn"
                        disabled={!jobDescription}
                        style={{ opacity: !jobDescription ? 0.5 : 1, cursor: !jobDescription ? 'not-allowed' : 'pointer' }}
                    >
                        Generate Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports' style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#e6edf3' }}>My Recent Interview Plans</h2>
                    <ul className='reports-list' style={{ listStyle: 'none', padding: 0 }}>
                        {reports.map(report => (
                            <li 
                                key={report._id} 
                                className='report-item' 
                                onClick={() => navigate(`/interview/${report._id}`)}
                                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                                <h3 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>
                                    {report.jobTitle || report.title || 'Untitled Position'}
                                </h3>
                                <p className='report-meta' style={{ fontSize: '0.8rem', color: '#7d8590', margin: '0.25rem 0' }}>
                                    Generated on {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
};

export default Home;
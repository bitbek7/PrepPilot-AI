import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import '../style/landing.scss'

const features = [
    {
        icon: '🎯',
        title: 'Targeted Strategy',
        description: 'Get interview preparation plans tailored specifically to the job description you provide.'
    },
    {
        icon: '📄',
        title: 'Resume Analysis',
        description: 'Upload your resume and get insights on how to align your experience with the role.'
    },
    {
        icon: '🤖',
        title: 'AI-Powered Insights',
        description: 'Leverage advanced AI to generate comprehensive interview strategies in seconds.'
    },
    {
        icon: '💡',
        title: 'Smart Preparation',
        description: 'Receive curated questions, talking points, and confidence-boosting tips.'
    },
    {
        icon: '📊',
        title: 'Gap Analysis',
        description: 'Identify skill gaps between your profile and the job requirements instantly.'
    },
    {
        icon: '🚀',
        title: 'Track Progress',
        description: 'Save and revisit your interview plans to track your preparation journey.'
    }
]

const steps = [
    {
        number: '01',
        title: 'Paste the Job Description',
        description: 'Copy the job listing and paste it into our smart analyzer.'
    },
    {
        number: '02',
        title: 'Upload Your Resume',
        description: 'Add your resume or describe your experience for personalized results.'
    },
    {
        number: '03',
        title: 'Get Your Strategy',
        description: 'Receive a comprehensive interview preparation plan powered by AI.'
    }
]

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav__logo">
                    <img src="/preppilotAilogo.png" alt='PrepPilot-logo' className="landing-nav__logo-icon" />
                    <span className="landing-nav__logo-text">Prep<span className="accent">Pilot</span></span>
                </div>
                <div className="landing-nav__links">
                    <Link to="/login" className="landing-nav__link">Log In</Link>
                    <Link to="/register" className="landing-nav__cta">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={`hero ${isVisible ? 'hero--visible' : ''}`}>
                <div className="hero__badge">
                    <span className="hero__badge-dot"></span>
                    AI-Powered Interview Prep
                </div>
                <h1 className="hero__title">
                    Ace Your Next Interview with
                    <span className="hero__title-gradient"> AI-Driven Strategy</span>
                </h1>
                <p className="hero__subtitle">
                    Transform job descriptions into personalized interview preparation plans.
                    Get targeted questions, talking points, and strategies — all in seconds.
                </p>
                <div className="hero__actions">
                    <Link to="/register" className="hero__btn hero__btn--primary">
                        Start Preparing Free
                        <span className="hero__btn-arrow">→</span>
                    </Link>
                    <Link to="/login" className="hero__btn hero__btn--secondary">
                        I have an account
                    </Link>
                </div>
                <div className="hero__stats">
                    <div className="hero__stat">
                        <span className="hero__stat-number">10K+</span>
                        <span className="hero__stat-label">Strategies Generated</span>
                    </div>
                    <div className="hero__stat-divider"></div>
                    <div className="hero__stat">
                        <span className="hero__stat-number">95%</span>
                        <span className="hero__stat-label">Success Rate</span>
                    </div>
                    <div className="hero__stat-divider"></div>
                    <div className="hero__stat">
                        <span className="hero__stat-number">5K+</span>
                        <span className="hero__stat-label">Happy Users</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <span className="section-tag">Features</span>
                    <h2 className="section-title">Everything You Need to <span className="accent">Succeed</span></h2>
                    <p className="section-subtitle">Our AI analyzes job descriptions and your profile to create the perfect interview strategy.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div className="feature-card" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="feature-card__icon">{feature.icon}</div>
                            <h3 className="feature-card__title">{feature.title}</h3>
                            <p className="feature-card__desc">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="section-header">
                    <span className="section-tag">How It Works</span>
                    <h2 className="section-title">Three Simple <span className="accent">Steps</span></h2>
                    <p className="section-subtitle">From job listing to interview-ready in under a minute.</p>
                </div>
                <div className="steps-row">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="step-card">
                                <span className="step-card__number">{step.number}</span>
                                <h3 className="step-card__title">{step.title}</h3>
                                <p className="step-card__desc">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="step-connector">
                                    <div className="step-connector__line"></div>
                                    <div className="step-connector__arrow">›</div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-card">
                    <div className="cta-card__glow"></div>
                    <h2 className="cta-card__title">Ready to Land Your Dream Job?</h2>
                    <p className="cta-card__subtitle">
                        Join thousands of candidates who've transformed their interview preparation with PrepPilot AI.
                    </p>
                    <Link to="/register" className="cta-card__btn">
                        Get Started — It's Free
                        <span className="cta-card__btn-arrow">→</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer__logo">
                    <img src="preppilotAilogo.png" alt='PrepPilot-logo' />
                    <span>Prep<span className="accent">Pilot</span></span>
                </div>
                <p className="landing-footer__copy">© 2026 PrepPilot AI. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default LandingPage;

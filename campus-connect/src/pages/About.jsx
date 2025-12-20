import React from 'react';

const About = () => {
    return (
        <div className="content-wrapper">
            <h2>About The Project</h2>

            <section className="about-section">
                <h3>The Problem: Information Fragmentation</h3>
                <p>New and existing students at MMMUT often face a disconnected experience. Key campus information—like
                    locations, faculty details, and academic resources—is scattered across physical notice boards or
                    hard-to-navigate legacy portals. This leads to confusion, especially for freshmen who struggle to
                    find their way around campus or locate the right professors.</p>
            </section>

            <section className="about-section">
                <h3>Our Solution: CampusConnect+</h3>
                <p>CampusConnect+ is an all-in-one digital assistant designed to unify the MMMUT experience. We provide
                    a single source of truth for campus life.</p>
                <ul className="feature-list">
                    <li><strong>Smart Navigation:</strong> A real-time CampGuide map to locate labs, hostels, and
                        offices.</li>
                    <li><strong>Faculty Directory:</strong> A centralized "Know Your Faculty" hub organized by
                        department.</li>
                    <li><strong>AI-Powered Assistance:</strong> An integrated Gemini AI bot that answers student queries
                        24/7.</li>
                    <li><strong>EduZone:</strong> A curated repository for academic resources and PYQs.</li>
                </ul>
            </section>

            <section className="about-section">
                <h3>The Impact</h3>
                <p>By digitizing campus navigation and information retrieval, we aim to reduce the anxiety of new
                    students, save valuable time for academic pursuits, and foster a more connected university
                    community.</p>
            </section>

            <div
                style={{ marginTop: '3rem', padding: '20px', border: '1px solid var(--accent-color)', borderRadius: '10px', background: 'rgba(0, 229, 255, 0.05)' }}>
                <h4 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>HackStrom 2025</h4>
                <p>Developed by Team <strong>NANDcoded</strong><br />
                    Members: Nishant, Naitik Kumar Singh, Dhruv Gupta, Abhinav Pandey</p>
            </div>
        </div>
    );
};

export default About;

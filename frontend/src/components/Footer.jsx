import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-branding">
                    <h2>CampusConnect+</h2>
                    <p>Bridging the gap between students<br />and campus resources.</p>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/camp-guide">Map</Link></li>
                            <li><Link to="/faculty/btech">Faculty</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul>
                            <li><Link to="/eduzone">EduZone</Link></li>

                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <ul>
                            <li><a href="https://mmmut.ac.in/" target="_blank" rel="noopener noreferrer">MMMUT Official</a></li>

                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 CampusConnect+. Developed by <span>Team NANDcoded</span> for HackStrom.</p>
            </div>
        </footer>
    );
};

export default Footer;

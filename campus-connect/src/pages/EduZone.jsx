import React from 'react';
import { Link } from 'react-router-dom';

import videoIcon from '../assets/video-lectures.png';

const EduZone = () => {
    return (
        <div className="content-wrapper">
            <h2>Eduzone - Academic Resources</h2>
            <p>Access curated study materials and video lectures.</p>

            <section className="features-section" style={{ padding: '20px 0' }}>
                <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>





                    <Link to="/eduzone/video-lectures" className="feature-card">
                        <img src={videoIcon} alt="Lectures" className="card-icon-img" />
                        <h3>Video Lectures</h3>
                        <p>Watch curated video playlists for your coursework.</p>
                    </Link>

                </div>
            </section>
        </div>
    );
};

export default EduZone;

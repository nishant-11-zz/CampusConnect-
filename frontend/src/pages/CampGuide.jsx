import React from 'react';

const CampGuide = () => {
    return (
        <div className="content-wrapper">
            <h2>Campus Guide</h2>
            <p>Explore the MMMUT campus in real-time. Find departments, hostels, canteens, and more.</p>

            {/* Map Section */}
            <div className="map-container">
                <iframe
                    src="https://maps.google.com/maps?q=26.731377702106418, 83.43312668191152&z=17&t=k&output=embed"
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="MMMUT Campus Map"
                >
                </iframe>
            </div>

            <p style={{ marginTop: '2rem' }}>Use the map above to get directions and see a live satellite view of the campus. You can zoom in to see individual buildings and landmarks.</p>
        </div>
    );
};

export default CampGuide;

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- THIS IS THE FIX

const MCAFaculty = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => {
                if(data.data) {
                    // FILTER: Only show Computer Science (CSE) & IT for MCA
                    const mcaCodes = ['CSE', 'IT'];
                    const filtered = data.data.filter(dept => mcaCodes.includes(dept.code));
                    setDepartments(filtered);
                }
                setLoading(false);
            })
            .catch(err => console.error("Error fetching data:", err));
    }, []);

    const handleCardClick = (dept) => setSelectedDept(dept);
    const closeModal = () => setSelectedDept(null);

    if (loading) return <div className="content-wrapper"><p>Loading MCA faculty data...</p></div>;

    return (
        <div className="content-wrapper">
            <h2>MCA Departments & Faculty</h2>
            <p style={{marginBottom: '2rem', color: 'var(--text-secondary)'}}>
                Master of Computer Applications faculty details and labs.
            </p>

            {/* GRID OF CARDS */}
            <div className="cards-grid">
                {departments.map((dept) => (
                    <div 
                        key={dept._id} 
                        className="feature-card" 
                        onClick={() => handleCardClick(dept)} 
                        style={{cursor: 'pointer', transition: 'transform 0.2s', position: 'relative'}}
                    >
                        {/* Dept Code Badge */}
                        <div style={{position: 'absolute', top: '15px', right: '15px', background: 'var(--accent-color)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem'}}>
                            {dept.code}
                        </div>

                        <h3 style={{paddingRight: '40px'}}>{dept.name}</h3>
                        
                        <div style={{marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                            <p>📍 {dept.building || "Main Campus"}</p>
                            
                            {/* HOD PREVIEW */}
                            {dept.hod && (
                                <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                                    <p style={{color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px'}}>HEAD OF DEPARTMENT</p>
                                    <p style={{fontWeight: '600'}}>{dept.hod.name}</p>
                                </div>
                            )}
                        </div>

                        <p style={{fontSize: '0.8rem', marginTop: 'auto', paddingTop: '15px', color: 'var(--accent-color)'}}>
                            Click for full details →
                        </p>
                    </div>
                ))}
            </div>

            {/* DETAILED MODAL POPUP - NOW TELEPORTED TO BODY */}
            {selectedDept && createPortal(
                <div style={modalOverlayStyle} onClick={closeModal}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        
                        {/* --- CLOSE BUTTON (Visible on top of everything) --- */}
                        <button 
                            style={closeButtonStyle} 
                            onClick={closeModal}
                            title="Close Details"
                        >
                            ×
                        </button>
                        
                        <h2 style={{color: 'var(--accent-color)', borderBottom: '1px solid var(--accent-color)', paddingBottom: '10px', paddingRight: '40px'}}>
                            {selectedDept.name} (MCA)
                        </h2>
                        
                        <p style={{margin: '15px 0', fontSize: '1.1rem'}}>{selectedDept.description}</p>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px'}}>
                            
                            {/* BLOCK 1: HOD DETAILS */}
                            {selectedDept.hod && (
                                <div style={infoBoxStyle}>
                                    <h4 style={{color: 'var(--accent-color)'}}>👤 Head of Department</h4>
                                    <p><strong>Name:</strong> {selectedDept.hod.name}</p>
                                    <p><strong>Email:</strong> {selectedDept.hod.email}</p>
                                    <p><strong>Cabin:</strong> {selectedDept.hod.cabin}</p>
                                </div>
                            )}

                            {/* BLOCK 2: CONTACT & LOCATION */}
                            <div style={infoBoxStyle}>
                                <h4 style={{color: 'var(--accent-color)'}}>📍 Location & Contact</h4>
                                <p><strong>Building:</strong> {selectedDept.building}</p>
                                <p><strong>Floor:</strong> {selectedDept.floor !== undefined ? selectedDept.floor : 'N/A'}</p>
                                <p><strong>Office:</strong> {selectedDept.contact?.office}</p>
                                <p><strong>Phone:</strong> {selectedDept.contact?.phone || 'N/A'}</p>
                                <p><strong>Email:</strong> {selectedDept.contact?.email}</p>
                                
                                {selectedDept.mapLink && (
                                    <a href={selectedDept.mapLink} target="_blank" rel="noreferrer" style={linkButtonStyle}>
                                        View on Map 🗺️
                                    </a>
                                )}
                            </div>

                            {/* BLOCK 3: LABS & VISITING HOURS */}
                            <div style={infoBoxStyle}>
                                <h4 style={{color: 'var(--accent-color)'}}>🕒 Visiting Hours</h4>
                                <p><strong>Weekdays:</strong> {selectedDept.visitingHours?.weekdays?.open} - {selectedDept.visitingHours?.weekdays?.close}</p>
                                <p><strong>Saturday:</strong> {selectedDept.visitingHours?.saturday?.open} - {selectedDept.visitingHours?.saturday?.close}</p>
                            </div>

                            {/* BLOCK 4: ROOMS */}
                            {selectedDept.roomNumbers && selectedDept.roomNumbers.length > 0 && (
                                <div style={infoBoxStyle}>
                                    <h4 style={{color: 'var(--accent-color)'}}>💻 Labs & Rooms</h4>
                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                                        {selectedDept.roomNumbers.map((room, idx) => (
                                            <span key={idx} style={tagStyle}>{room}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body // <--- Renders modal directly into the body tag
            )}
        </div>
    );
};

// --- STYLES (Clean & Professional) ---
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 99999 // Very high z-index
};

const modalContentStyle = {
    backgroundColor: '#111', padding: '25px', borderRadius: '16px',
    maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
    position: 'relative', border: '1px solid var(--accent-color)',
    boxShadow: '0 0 40px rgba(0, 229, 255, 0.15)',
    animation: 'fadeIn 0.3s ease-out'
};

const closeButtonStyle = {
    position: 'absolute', top: '15px', right: '15px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%', width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 100,
    transition: 'all 0.2s ease'
};

const infoBoxStyle = {
    background: 'rgba(255, 255, 255, 0.03)', padding: '12px',
    borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.9rem'
};

const tagStyle = {
    background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-color)',
    padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
    border: '1px solid rgba(0, 229, 255, 0.2)'
};

const linkButtonStyle = {
    display: 'inline-block', marginTop: '8px', textDecoration: 'none',
    color: '#000', backgroundColor: 'var(--accent-color)', padding: '6px 12px',
    borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center'
};

export default MCAFaculty;
import React, { useState, useEffect } from 'react';

const BTechFaculty = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => {
                if(data.data) setDepartments(data.data);
                setLoading(false);
            })
            .catch(err => console.error("Error fetching departments:", err));
    }, []);

    const handleCardClick = (dept) => setSelectedDept(dept);
    const closeModal = () => setSelectedDept(null);

    if (loading) return <div className="content-wrapper"><p>Loading department data...</p></div>;

    return (
        <div className="content-wrapper">
            <h2>B.Tech Departments</h2>
            
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
                            
                            {/* HOD PREVIEW ON CARD */}
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

            {/* DETAILED MODAL POPUP */}
            {selectedDept && (
                <div style={modalOverlayStyle} onClick={closeModal}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <button style={closeButtonStyle} onClick={closeModal}>×</button>
                        
                        <h2 style={{color: 'var(--accent-color)', borderBottom: '1px solid var(--accent-color)', paddingBottom: '10px'}}>{selectedDept.name} ({selectedDept.code})</h2>
                        
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

                            {/* BLOCK 3: VISITING HOURS */}
                            <div style={infoBoxStyle}>
                                <h4 style={{color: 'var(--accent-color)'}}>🕒 Visiting Hours</h4>
                                <p><strong>Weekdays:</strong> {selectedDept.visitingHours?.weekdays?.open} - {selectedDept.visitingHours?.weekdays?.close}</p>
                                <p><strong>Saturday:</strong> {selectedDept.visitingHours?.saturday?.open} - {selectedDept.visitingHours?.saturday?.close}</p>
                                <p><strong>Closed:</strong> {selectedDept.visitingHours?.closedDays?.join(', ') || "None"}</p>
                            </div>

                            {/* BLOCK 4: ROOMS */}
                            {selectedDept.roomNumbers && selectedDept.roomNumbers.length > 0 && (
                                <div style={infoBoxStyle}>
                                    <h4 style={{color: 'var(--accent-color)'}}>🚪 Key Rooms</h4>
                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                                        {selectedDept.roomNumbers.map((room, idx) => (
                                            <span key={idx} style={tagStyle}>{room}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
};

const modalContentStyle = {
    backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px',
    maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto',
    position: 'relative', border: '1px solid var(--accent-color)',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.2)'
};

const closeButtonStyle = {
    position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none',
    color: '#fff', fontSize: '30px', cursor: 'pointer', lineHeight: '1'
};

const infoBoxStyle = {
    background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)'
};

const tagStyle = {
    background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-color)',
    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'
};

const linkButtonStyle = {
    display: 'inline-block', marginTop: '10px', textDecoration: 'none',
    color: '#000', backgroundColor: 'var(--accent-color)', padding: '5px 10px',
    borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem'
};

export default BTechFaculty;
import React from 'react';
import calculating from '../../assets/calculating.png';
import physics from '../../assets/physics.png';
import webDesign from '../../assets/web-design.png';
import development from '../../assets/development.png';
import fuseBox from '../../assets/fuse-box.png';
import greenChemistry from '../../assets/green-chemistry.png';
import writing from '../../assets/writing.png';
import humanValues from '../../assets/customer.png';
import electronic from '../../assets/motherboard.png';

const subjects = [
    { name: "Engineering Mathematics I", icon: calculating },
    { name: "Engineering Mathematics II", icon: calculating },
    { name: "Engineering Physics", icon: physics },
    { name: "Web Designing I", icon: webDesign },
    { name: "Web Designing II", icon: webDesign },
    { name: "C programming", icon: development },
    { name: "Basic Electrical Engineering", icon: fuseBox },
    { name: "Env. Science and Green Chemistry", icon: greenChemistry },
    { name: "Techn. Writing and Prof. Comm.", icon: writing },
    { name: "Univ. Human Values", icon: humanValues },
    { name: "Electronic Components", icon: electronic }
];

const PYPs = () => {
    return (
        <div className="content-wrapper">
            <h2>Previous Year Papers</h2>
            <p>Select a subject to view available question papers.</p>

            <div className="subject-grid">
                {subjects.map((subject, index) => (
                    <div key={index} className="subject-card">
                        <img src={subject.icon} alt={subject.name} className="subject-icon-img" />
                        <h3>{subject.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PYPs;

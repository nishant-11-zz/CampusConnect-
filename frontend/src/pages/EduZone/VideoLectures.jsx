import React from 'react';
import calculating from '../../assets/calculating.png';
import physics from '../../assets/physics.png';
import webDesign from '../../assets/web-design.png';
import development from '../../assets/development.png';
import fuseBox from '../../assets/fuse-box.png';
import greenChemistry from '../../assets/green-chemistry.png';

const subjects = [
    {
        name: "Engineering Mathematics I",
        icon: calculating,
        links: {
            "Unit 1": "https://www.youtube.com/watch?v=FVf44QzAles&list=PL5Dqs90qDljVfkrGSSBFHZzX0ZEFiCrro",
            "Unit 2": "https://www.youtube.com/watch?v=TStqBRLePoM&list=PL5Dqs90qDljVRsz1E2tnxpDBTRwZlvrHN",
            "Unit 3": "https://www.youtube.com/watch?v=pVJhO86ZhHk&list=PL5Dqs90qDljVUxYTATfL8sYBQOiPV1pGg",
            "Unit 4": "https://www.youtube.com/watch?v=QmMLgdxyWdQ&list=PL5Dqs90qDljWW4kE0Tqt7MQrEQMrxFalZ"
        }
    },
    {
        name: "Engineering Mathematics II",
        icon: calculating,
        links: {
            "Unit 1": "https://www.youtube.com/watch?v=uUVyrP5HV1E&list=PL5Dqs90qDljWefUR1jFJgDVn_swKGVENk",
            "Unit 2": "https://www.youtube.com/watch?v=JOtY4xhsQLA&list=PLhSp9OSVmeyKv5l_nJlvC-lu-P1qszMMQ",
            "Unit 3": "https://www.youtube.com/watch?v=Edz79_JsGvc&list=PL5Dqs90qDljXYjZ8kDHtpMqPGKNGb2dxu",
            "Unit 4": "https://www.youtube.com/watch?v=L8MRqy6GtHk&list=PL5Dqs90qDljVS_IhzGalSGGy-VmyOh2hN&pp=0gcJCbAEOCosWNin"
        }
    },
    {
        name: "Engineering Physics",
        icon: physics,
        links: {
            "Unit 1": "https://www.youtube.com/watch?v=wqnNmr-yewE&list=PLhX7RLRxqtuqxaLkpqedfrlnuJNMwJ3cl",
            "Unit 2": "https://www.youtube.com/watch?v=mDh7KWFBPXQ&list=PLnU_6InKwomFPUn1k5np6NtnoU38TW2PT",
            "Unit 3": "https://www.youtube.com/watch?v=cEhjGFXgqd4",
            "Unit 4": "https://www.youtube.com/watch?v=3FTAgnE4Quw"
        }
    },
    {
        name: "Web Designing I",
        icon: webDesign,
        links: {
            "Unit 1": "https://www.youtube.com/watch?v=HcOc7P5BMi4",
            "Unit 2": " https://www.youtube.com/watch?v=ESnrn1kAD4E",
            "Unit 3": "https://www.youtube.com/watch?v=VlPiVmYuoqw",
            "Unit 4": "https://www.youtube.com/watch?v=aCOBakZSdmE&list=PLC3y8-rFHvwjfc2yJlldxjodwpUhVvDPg"
        }
    },
    {
        name: "Web Designing II",
        icon: webDesign,
        links: {
            "Unit 1 & 2": "https://www.youtube.com/watch?v=AZzV3wZCvI4&list=PL78RhpUUKSwfeSOOwfE9x6l5jTjn5LbY3",
            "Unit 3": "https://youtu.be/yE6tIle64tU?si=3vAZ2FrI59m_XSpt",
            "Unit 4": " https://youtu.be/NTOcdjMs8E4?si=dgrxKlIQICRbgW2N"
        }
    },
    {
        name: "C programming",
        icon: development,
        links: "https://www.youtube.com/playlist?list=PLu0W_9lII9aiXlHcLx-mDH1Qul38wD3aR"
    },
    {
        name: "Basic Electrical Engineering",
        icon: fuseBox,
        links: "https://www.youtube.com"
    },
    {
        name: "Env. Science and Green Chemistry",
        icon: greenChemistry,
        links: "https://www.youtube.com"
    }
];

const VideoLectures = () => {
    return (
        <div className="content-wrapper">
            <h2>Video Lectures</h2>
            <p>Select a subject to watch curated lecture playlists. Hover over tiles for unit options.</p>

            <div className="subject-grid">
                {subjects.map((subject, index) => {
                    const isDirectLink = typeof subject.links === 'string';

                    const CardContent = (
                        <>
                            <img src={subject.icon} alt={subject.name} className="subject-icon-img" />
                            <h3>{subject.name}</h3>
                        </>
                    );


                    if (isDirectLink) {
                        return (
                            <a
                                key={index}
                                href={subject.links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="subject-card"
                                style={{ textDecoration: 'none' }}
                            >
                                {CardContent}
                            </a>
                        );
                    }


                    return (
                        <div key={index} className="subject-card subject-dropdown-wrapper">
                            {CardContent}


                            <ul className="subject-dropdown-menu">
                                {Object.entries(subject.links).map(([unitName, url]) => (
                                    <li key={unitName}>
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            {unitName}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VideoLectures;

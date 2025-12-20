import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CampGuide from './pages/CampGuide';
import EduZone from './pages/EduZone';
import About from './pages/About';
import BTechFaculty from './pages/Faculty/BTechFaculty';
import MTechFaculty from './pages/Faculty/MTechFaculty';
import MCAFaculty from './pages/Faculty/MCAFaculty';
import PYPs from './pages/EduZone/PYPs';
import VideoLectures from './pages/EduZone/VideoLectures';
import Background from './components/Background';

function App() {
  return (
    <Router>
      <Background />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="camp-guide" element={<CampGuide />} />
          <Route path="eduzone" element={<EduZone />} />
          <Route path="eduzone/pyps" element={<PYPs />} />
          <Route path="eduzone/video-lectures" element={<VideoLectures />} />
          <Route path="about" element={<About />} />
          <Route path="faculty/btech" element={<BTechFaculty />} />
          <Route path="faculty/mtech" element={<MTechFaculty />} />
          <Route path="faculty/mca" element={<MCAFaculty />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

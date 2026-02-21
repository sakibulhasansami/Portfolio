
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Writings from './pages/Writings';
import Projects from './pages/Projects';
import About from './pages/About';
import Admin from './pages/Admin';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="writings" element={<Writings />} />
              <Route path="projects" element={<Projects />} />
              <Route path="about" element={<About />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

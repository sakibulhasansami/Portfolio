import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Writings from './pages/Writings';
import Projects from './pages/Projects';
import About from './pages/About';
import Admin from './pages/Admin';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // 🔴 UPDATED: Added useTheme
import { LanguageProvider } from './context/LanguageContext';

// ==========================================
// 🔴 NEW: PRO CUSTOM CURSOR COMPONENT
// ==========================================
const CustomCursor = () => {
  const { themeConfig } = useTheme(); // Theme er sathe color match korar jonno
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Link ba Button er upor mouse nile effect change hobe
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.tagName.toLowerCase() === 'a' || 
                          target.tagName.toLowerCase() === 'button' || 
                          target.closest('a') || 
                          target.closest('button') || 
                          target.closest('input') || 
                          target.closest('textarea');
      setIsHovering(Boolean(isClickable));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    // Mobile e hide rakhar jonno 'hidden md:block'
    <div className={`hidden md:block pointer-events-none fixed inset-0 z-[9999] ${themeConfig.styles.textMain}`}>
      {/* Main Small Dot */}
      <div 
        className="absolute rounded-full bg-current transition-transform duration-75 ease-out"
        style={{ 
          left: mousePos.x, top: mousePos.y, 
          width: '8px', height: '8px', 
          transform: `translate(-50%, -50%) scale(${isHovering ? 0 : 1})`
        }}
      />
      {/* Outer Trailing Ring */}
      <div 
        className="absolute rounded-full border border-current transition-all duration-300 ease-out"
        style={{ 
          left: mousePos.x, top: mousePos.y, 
          width: '32px', height: '32px', 
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
          backgroundColor: isHovering ? 'currentColor' : 'transparent',
          opacity: isHovering ? 0.2 : 0.5
        }}
      />
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {/* 🔴 NEW: Custom Cursor Ekhane Add Kora Holo */}
        <CustomCursor />
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

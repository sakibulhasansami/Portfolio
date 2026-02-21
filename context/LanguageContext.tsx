
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// We revert to English as the source of truth in the code.
// Google Translate will handle converting this to BN/AR/EN.
export const translations = {
  nav: { home: 'Home', gallery: 'Gallery', writings: 'Writings', projects: 'Projects', profile: 'Profile' },
  home: { visuals: 'Visuals', stories: 'Stories', works: 'Works', identity: 'Identity', loading: 'Loading...' },
  about: { education: 'Education', location: 'Location', email: 'Email', bio: 'Biography', heroBioDefault: 'Welcome to my digital space.', surveyor: 'Surveyor & Tech Enthusiast' },
  footer: { connect: 'Connect', contact: 'Contact', rights: 'S-71 Studio | RGSI', desc: 'I am Sakibul Hasan Sami, a versatile and creative individual, currently a student of Cadastral, Topographic Survey, and Land Information Technology.' },
  gallery: { title: 'Visual Gallery', subtitle: 'A collection of moments frozen in time.', search: 'Search photos...', all: 'All', download: 'Download', noResults: 'No photos match your search.' },
  writings: { title: 'Library', subtitle: 'Novels, short stories, and thoughts.', search: 'Search title or content...', read: 'Read Now', noResults: 'No writings found.' },
  projects: { title: 'Projects Showcase', subtitle: 'Explore my latest technical works and experiments.', viewProject: 'View Project', visitLink: 'Visit Project Link', noResults: 'No projects found.' }
};

interface LanguageContextType {
  currentLang: string;
  changeLanguage: (langCode: string) => void;
  t: typeof translations;
  translateDynamic: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');

  // Initialize Language from Cookie
  useEffect(() => {
    try {
      const checkCookie = () => {
        const cookie = document.cookie.split('; ').find(row => row.trim().startsWith('googtrans='));
        if (cookie) {
          // format: googtrans=/en/bn -> bn
          const parts = cookie.split('/');
          const lang = parts[parts.length - 1];
          if (lang) setCurrentLang(lang);
        } else {
          // If no cookie, default is English (source)
          setCurrentLang('en');
        }
      };
      checkCookie();
    } catch (e) {
      console.warn("Cookie access failed", e);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    if (langCode === currentLang) return; // Prevent reload if same language

    try {
      // 1. Clear existing cookie to prevent conflicts
      const domain = window.location.hostname;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      // 2. Set new cookie
      // '/auto/target' is safest.
      const cookieValue = `/auto/${langCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      
      setCurrentLang(langCode);
      
      // 3. Force Reload
      window.location.reload(); 
    } catch (e) {
      console.error("Language switch failed", e);
    }
  };

  // RTL Handling
  useEffect(() => {
    if (currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = currentLang;
    }
  }, [currentLang]);

  const translateDynamic = (text: string) => text;

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t: translations, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

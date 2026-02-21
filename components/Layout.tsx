
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, ChevronUp, Globe, Check } from 'lucide-react';
import { fetchSettings } from '../services/firebase';
import { SocialLink } from '../types';

const Layout: React.FC = () => {
  const { themeConfig } = useTheme();
  const { t, changeLanguage, currentLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Footer Data
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactEmail, setContactEmail] = useState("sakibulhasansami863@gmail.com");
  const [contactLoc, setContactLoc] = useState("Rajshahi, Bangladesh");

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const navOrder = ['/', '/gallery', '/writings', '/projects', '/about'];
  const prevIndex = useRef(navOrder.indexOf(location.pathname));
  const [animClass, setAnimClass] = useState('slide-in-right');

  // Fetch Settings for Footer
  useEffect(() => {
    fetchSettings().then(settings => {
      if (settings) {
        if (settings.socialLinks && settings.socialLinks.length > 0) {
          setSocialLinks(settings.socialLinks);
        } else {
          // Fallback Default Display for new users before Admin setup
          setSocialLinks([
            { platform: 'Facebook', url: '#', iconClass: 'fa-brands fa-facebook' },
            { platform: 'Instagram', url: '#', iconClass: 'fa-brands fa-instagram' }
          ]);
        }

        if (settings.email) setContactEmail(settings.email);
        if (settings.location) setContactLoc(settings.location);
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  // Scroll Animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    const attachObserver = () => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach(el => observer.observe(el));
    };

    attachObserver();
    const timeout = setTimeout(attachObserver, 500);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [location.pathname]);

  // Page Transition Direction
  useEffect(() => {
    const currentIndex = navOrder.indexOf(location.pathname);
    if (currentIndex > -1 && prevIndex.current > -1) {
      setAnimClass(currentIndex > prevIndex.current ? 'slide-in-right' : 'slide-in-left');
    } else {
      setAnimClass('animate-fade-in');
    }
    prevIndex.current = currentIndex;
  }, [location.pathname]);

  // Swipe Logic
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < minSwipeDistance) return;
    const currentIndex = navOrder.indexOf(location.pathname);
    if (currentIndex === -1) return;
    if (distance > 0 && currentIndex < navOrder.length - 1) navigate(navOrder[currentIndex + 1]);
    if (distance < 0 && currentIndex > 0) navigate(navOrder[currentIndex - 1]);
  };

  useEffect(() => {
    const checkScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const navItems = [
    { path: '/', iconClass: 'fa-house', label: t.nav.home },
    { path: '/gallery', iconClass: 'fa-camera', label: t.nav.gallery },
    { path: '/writings', iconClass: 'fa-book', label: t.nav.writings },
    { path: '/projects', iconClass: 'fa-briefcase', label: t.nav.projects },
    { path: '/about', iconClass: 'fa-user', label: t.nav.profile },
  ];

  const languages = [
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية (Arabic)' }
  ];

  return (
    <div 
      className="flex flex-col min-h-[100dvh] relative overflow-x-hidden text-sm md:text-base transition-colors duration-500"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {/* Navigation */}
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm sm:max-w-md">
        <nav className={`px-8 py-4 flex justify-between items-center transition-all duration-500 ${themeConfig.styles.navBg} ${themeConfig.styles.radius} ${themeConfig.styles.shadow}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} to={item.path}
                className={`text-xl transition-all duration-300 transform hover:scale-125 ${themeConfig.styles.navIconHover} ${
                  isActive ? themeConfig.styles.accentText : `${themeConfig.styles.textMain} opacity-60 hover:opacity-100`
                }`}
                title={item.label}
              >
                <i className={`fa-solid ${item.iconClass}`}></i>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content - Reduced padding to prevent gap below footer */}
      <main className="flex-grow pt-32 pb-12 px-4 max-w-5xl mx-auto w-full overflow-visible">
        <div key={location.pathname} className={`page-transition-wrapper ${animClass}`}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-auto py-8 ${themeConfig.styles.cardBg} border-t ${themeConfig.styles.border} relative z-20`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-xl font-bold tracking-widest uppercase mb-3 ${themeConfig.styles.textMain}`}>
            RGSI | S-71 STUDIO
          </h2>
          <p className={`text-xs md:text-sm mb-6 max-w-xl mx-auto opacity-70 ${themeConfig.styles.textMain}`}>
            {t.footer.desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${themeConfig.styles.accentText}`}>{t.footer.connect}</h3>
              <div className="flex flex-col gap-2 text-sm">
                {socialLinks.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 hover:text-green-500 transition-colors ${themeConfig.styles.textMain}`}>
                    <i className={link.iconClass}></i> <span>{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${themeConfig.styles.accentText}`}>{t.footer.contact}</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className={`flex items-center gap-2 ${themeConfig.styles.textMain}`}>
                  <i className="fa-solid fa-location-dot text-green-500"></i>
                  <span>{contactLoc}</span>
                </div>
                <div className={`flex items-center gap-2 ${themeConfig.styles.textMain}`}>
                  <i className="fa-solid fa-envelope text-green-500"></i>
                  <span>{contactEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`pt-4 border-t ${themeConfig.styles.border} flex flex-col md:flex-row justify-center items-center gap-4 opacity-60 text-[10px] ${themeConfig.styles.textMain}`}>
            
            {/* Language Switcher Button */}
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 ${themeConfig.styles.radius} border ${themeConfig.styles.border} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
              >
                <Globe size={14} />
                <span>{languages.find(l => l.code === currentLang)?.label || 'Language'}</span>
                <ChevronUp size={12} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLangMenu && (
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.radius} shadow-xl overflow-hidden animate-fade-in`}>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 ${themeConfig.styles.textMain}`}
                    >
                      <span>{lang.label}</span>
                      {currentLang === lang.code && <Check size={12} className={themeConfig.styles.accentText} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span>&copy; 2026 {t.footer.rights}</span>
              <Link to="/admin" className="hover:text-green-500 transition-colors">
                <Lock size={10} />
              </Link>
            </div>
          </div>

          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`absolute bottom-6 right-6 w-10 h-10 flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-40 ${
              showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            } ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.textMain} ${themeConfig.styles.radius} ${themeConfig.styles.shadow}`}
          >
            <ChevronUp size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
    

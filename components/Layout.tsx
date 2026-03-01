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

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactEmail, setContactEmail] = useState("sakibulhasansami863@gmail.com");
  const [contactLoc, setContactLoc] = useState("Rajshahi, Bangladesh");

  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchEndPos = useRef<{ x: number; y: number } | null>(null);

  const navOrder = ['/', '/gallery', '/writings', '/projects', '/about'];

  // ✅ FIX: animClass শুধু transition এর জন্য, active check এর সাথে কোনো সম্পর্ক নেই
  const prevPathRef = useRef(location.pathname);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    fetchSettings().then(settings => {
      if (settings) {
        setSocialLinks(
          settings.socialLinks?.length > 0
            ? settings.socialLinks
            : [
                { platform: 'Facebook', url: '#', iconClass: 'fa-brands fa-facebook' },
                { platform: 'Instagram', url: '#', iconClass: 'fa-brands fa-instagram' },
              ]
        );
        if (settings.email) setContactEmail(settings.email);
        if (settings.location) setContactLoc(settings.location);
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const prevIdx = navOrder.indexOf(prevPath);
    const currIdx = navOrder.indexOf(location.pathname);

    if (prevIdx !== -1 && currIdx !== -1 && prevIdx !== currIdx) {
      setAnimClass(currIdx > prevIdx ? 'slide-in-right' : 'slide-in-left');
    } else {
      setAnimClass('animate-fade-in');
    }

    // ✅ FIX: pathname update হওয়ার পরেই prevPath update করছি
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const minSwipeDistance = 150;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndPos.current = null;
    touchStartPos.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndPos.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!touchStartPos.current || !touchEndPos.current) return;
    const xDist = touchStartPos.current.x - touchEndPos.current.x;
    const yDist = touchStartPos.current.y - touchEndPos.current.y;
    const isHorizontal = Math.abs(xDist) > Math.abs(yDist);

    if (isHorizontal && Math.abs(xDist) > minSwipeDistance) {
      // ✅ FIX: location.pathname থেকে সরাসরি current index নাও — ref নয়
      const currentIndex = navOrder.indexOf(location.pathname);
      if (currentIndex === -1) return;
      if (xDist > 0 && currentIndex < navOrder.length - 1) navigate(navOrder[currentIndex + 1]);
      else if (xDist < 0 && currentIndex > 0) navigate(navOrder[currentIndex - 1]);
    }

    touchStartPos.current = null;
    touchEndPos.current = null;
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
    { code: 'ar', label: 'العربية (Arabic)' },
  ];

  return (
    <div
      className="flex flex-col min-h-[100dvh] relative w-full max-w-[100vw] overflow-x-hidden text-sm md:text-base transition-colors duration-500"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Navigation ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm px-2">
        <nav
          className={`
            px-6 py-3 flex justify-between items-center
            transition-all duration-500
            ${themeConfig.styles.navBg} ${themeConfig.styles.radius} ${themeConfig.styles.shadow}
            ring-1 ring-white/10
          `}
        >
          {navItems.map(item => {
            // ✅ FIX: শুধুমাত্র location.pathname দিয়ে strict match — কোনো state বা ref নয়
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`
                  relative flex items-center justify-center w-10 h-10
                  rounded-full text-base transition-all duration-300
                  ${isActive
                    ? `${themeConfig.styles.accentText} scale-110`
                    : `${themeConfig.styles.textMain} opacity-40 hover:opacity-80 hover:scale-110`
                  }
                `}
              >
                <i className={`fa-solid ${item.iconClass}`}></i>
                {/* Active dot indicator */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-grow pt-28 pb-12 px-4 max-w-5xl mx-auto w-full overflow-x-hidden">
        <div key={location.pathname} className={`page-transition-wrapper ${animClass} w-full`}>
          <Outlet />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={`mt-auto py-8 ${themeConfig.styles.cardBg} border-t ${themeConfig.styles.border} relative z-20 w-full`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-xl font-bold tracking-widest uppercase mb-2 ${themeConfig.styles.textMain}`}>
            RGSI | S-71 STUDIO
          </h2>
          <p className={`text-xs md:text-sm mb-6 max-w-xl mx-auto opacity-60 ${themeConfig.styles.textMain}`}>
            {t.footer.desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${themeConfig.styles.accentText}`}>
                {t.footer.connect}
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                {socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 hover:text-green-500 transition-colors ${themeConfig.styles.textMain}`}
                  >
                    <i className={link.iconClass}></i>
                    <span>{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${themeConfig.styles.accentText}`}>
                {t.footer.contact}
              </h3>
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

          <div
            className={`pt-4 border-t ${themeConfig.styles.border} flex flex-col md:flex-row justify-center items-center gap-4 opacity-60 text-[10px] ${themeConfig.styles.textMain}`}
          >
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 ${themeConfig.styles.radius} border ${themeConfig.styles.border} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
              >
                <Globe size={14} />
                <span>{languages.find(l => l.code === currentLang)?.label || 'Language'}</span>
                <ChevronUp size={12} className={`transition-transform ${showLangMenu ? '' : 'rotate-180'}`} />
              </button>
              {showLangMenu && (
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.radius} shadow-xl overflow-hidden animate-fade-in`}
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${themeConfig.styles.textMain}`}
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

          {/* Scroll To Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`
              absolute bottom-6 right-6 w-9 h-9 flex items-center justify-center
              transition-all duration-300 transform hover:scale-110 z-40
              ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
              ${themeConfig.styles.cardBg} border ${themeConfig.styles.border}
              ${themeConfig.styles.textMain} ${themeConfig.styles.radius} ${themeConfig.styles.shadow}
            `}
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

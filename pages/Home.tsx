import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchSettings } from '../services/firebase';
import { AnimationType } from '../types';
import { Image, Book, Briefcase, User } from 'lucide-react';
import HeroCanvas from '../components/HeroCanvas';

const Home: React.FC = () => {
  const { themeConfig, theme } = useTheme();
  const { t, translateDynamic } = useLanguage();
  const [bio, setBio] = useState<string>(t.home.loading);
  const [heroImage, setHeroImage] = useState<string>('');
  const [heroAnim, setHeroAnim] = useState<AnimationType>('anim-static');

  // Custom Color States
  const [heroBorderColor, setHeroBorderColor] = useState<string>('');
  const [heroAnimColor, setHeroAnimColor] = useState<string>('');
  const [heroAnimColor2, setHeroAnimColor2] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const settings = await fetchSettings();
      if (settings) {
        setBio(settings.bio || t.about.heroBioDefault);
        setHeroImage(settings.heroImageUrl);
        setHeroAnim(settings.heroAnimation);
        setHeroBorderColor(settings.heroBorderColor);
        setHeroAnimColor(settings.heroAnimColor);
        setHeroAnimColor2(settings.heroAnimColor2);
      }
    };
    loadData();
  }, [t]);

  const getBoxStyle = (index: number) => {
    if (theme === 'Cyber OS') {
      const isRed = index === 1 || index === 2;
      const color = isRed ? '#FF0000' : '#00FF41';

      return {
        borderColor: color,
        color: color,
        boxShadow: 'none', 
        backgroundColor: '#000000' 
      };
    }
    return {}; 
  };

  const navBoxes = [
    { title: t.nav.gallery, path: '/gallery', icon: Image, desc: t.home.visuals },
    { title: t.nav.writings, path: '/writings', icon: Book, desc: t.home.stories },
    { title: t.nav.projects, path: '/projects', icon: Briefcase, desc: t.home.works },
    { title: t.nav.profile, path: '/about', icon: User, desc: t.home.identity },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] w-full max-w-2xl mx-auto space-y-8">

      {/* FULL PAGE BACKGROUND CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 w-full h-full overflow-hidden">
         <HeroCanvas type={heroAnim} color1={heroAnimColor} color2={heroAnimColor2} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 group text-center mt-4">
        <div className="relative w-40 h-40 md:w-52 md:h-52 mx-auto mb-6">
          <div 
            className={`relative z-10 w-full h-full border-4 p-1 rounded-full ${heroAnim} ${themeConfig.styles.cardBg} ${themeConfig.styles.shadow}`}
            style={{ borderColor: heroBorderColor || undefined }}
          >
            <img 
              src={heroImage || "https://picsum.photos/200"} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {theme === 'Cyber OS' && (
            <div className="absolute -inset-2 rounded-full border border-[#00FF41]/30 animate-spin-slow pointer-events-none z-20"></div>
          )}
        </div>

        {/* Text Content - Removed "reveal" and delays for instant appearance */}
        <div className="space-y-3 px-4">
          <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight ${themeConfig.styles.textMain}`}>
            Sakibul Hasan Sami
          </h1>
          <p className={`text-sm md:text-base max-w-md mx-auto leading-relaxed ${themeConfig.styles.textSecondary} font-medium`}>
            {translateDynamic(bio)}
          </p>
        </div>
      </div>

      {/* Navigation Grid - Removed "reveal" class */}
      <div className="relative z-10 grid grid-cols-2 gap-4 w-full px-4 sm:px-8">
        {navBoxes.map((box, idx) => {
          const cyberStyle = getBoxStyle(idx);

          return (
            <Link 
              key={box.path} 
              to={box.path}
              style={cyberStyle}
              className={`
                group relative flex flex-col items-center justify-center p-6 border transition-all duration-300
                hover:scale-[1.02] active:scale-95
                ${themeConfig.styles.radius}
                ${theme !== 'Cyber OS' ? `${themeConfig.styles.cardBg} ${themeConfig.styles.border} ${themeConfig.styles.textMain} ${themeConfig.styles.shadow}` : 'hover:bg-opacity-80'}
              `}
            >
              <box.icon 
                size={28} 
                className={`mb-3 transition-transform duration-300 group-hover:-translate-y-1 ${theme !== 'Cyber OS' ? themeConfig.styles.accentText : ''}`} 
                style={theme === 'Cyber OS' ? { color: cyberStyle.color } : {}}
              />
              <span className="text-base font-bold tracking-wide">{box.title}</span>
              <span className="text-xs opacity-60 uppercase tracking-wider mt-1">{box.desc}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Home;

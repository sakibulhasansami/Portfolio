
import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchSettings } from '../services/firebase';
import { Settings } from '../types';
import { GraduationCap, MapPin, Mail, User } from 'lucide-react';

const About: React.FC = () => {
  const { themeConfig, theme } = useTheme();
  const { t, translateDynamic } = useLanguage();
  const [data, setData] = useState<Settings | null>(null);

  useEffect(() => {
    fetchSettings().then(s => setData(s));
  }, []);

  if (!data) return <div className="p-10 text-center opacity-50">{t.home.loading}</div>;

  const isCyber = theme === 'Cyber OS';
  
  // Clean, high-contrast style without shadows for Cyber OS
  const containerStyle = isCyber 
    ? { borderColor: '#FF0000', color: '#FF0000', backgroundColor: '#000000' } 
    : {};
  
  const labelStyle = isCyber 
    ? { color: '#FF0000' } 
    : {};

  const heroNameStyle = isCyber
    ? { color: '#FF0000' }
    : {};

  // Updated container classes to include 'break-words' to prevent horizontal overflow
  const containerClasses = `
    p-5 md:p-6 border transition-all duration-300 hover:shadow-md flex flex-col justify-center
    break-words overflow-hidden
    ${themeConfig.styles.radius} ${themeConfig.styles.shadow}
    ${!isCyber ? `${themeConfig.styles.cardBg} ${themeConfig.styles.border}` : 'border-2'}
  `;

  // Apply Scale/DPI Setting - Only applying on larger screens to avoid mobile breaking
  const zoomLevel = data.contentScale || 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const scaleStyle: React.CSSProperties = !isMobile ? {
    zoom: zoomLevel,
    MozTransform: `scale(${zoomLevel})`,
    MozTransformOrigin: 'top center',
    width: zoomLevel !== 1 ? `${100 / zoomLevel}%` : '100%',
    marginLeft: zoomLevel !== 1 ? 'auto' : undefined,
    marginRight: zoomLevel !== 1 ? 'auto' : undefined,
  } : {};

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-10 space-y-5 md:space-y-6 w-full" style={scaleStyle}>
      
      {/* 1. HERO CONTAINER */}
      <div 
        className={`${containerClasses} md:flex-row gap-5 md:gap-8 items-start md:items-center min-h-[250px]`}
        style={containerStyle}
      >
        <div className="flex flex-col items-center md:items-start w-full">
           <div className="flex flex-col md:flex-row w-full gap-6 items-center">
              {/* Image */}
              <div className="shrink-0">
                <div className={`w-32 h-32 md:w-48 md:h-48 overflow-hidden border-4 shadow-lg ${themeConfig.styles.radius} ${isCyber ? 'border-[#FF0000]' : themeConfig.styles.border}`}>
                  <img 
                    src={data.heroImageUrl || "https://picsum.photos/400"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Name & Title */}
              <div className="text-center md:text-left w-full">
                <h1 
                  className={`text-2xl md:text-5xl font-extrabold mb-2 tracking-tight ${themeConfig.styles.textMain}`}
                  style={heroNameStyle}
                >
                  Sakibul Hasan Sami
                </h1>
                <p className={`text-lg md:text-xl opacity-80 ${isCyber ? 'text-red-400' : themeConfig.styles.accentText}`}>
                  {t.about.surveyor}
                </p>
              </div>
           </div>

           {/* Short Bio */}
           <div className="mt-6 w-full border-t pt-4 opacity-90 text-sm md:text-lg leading-relaxed" style={{ borderColor: isCyber ? '#FF0000' : 'inherit' }}>
              <p className={isCyber ? 'text-red-100' : themeConfig.styles.textMain}>
                {translateDynamic(data.bio) || t.about.heroBioDefault}
              </p>
           </div>
        </div>
      </div>

      {/* 2, 3, 4. INFO CONTAINERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Education */}
        <div className={containerClasses} style={containerStyle}>
          <div className="flex items-center gap-3 mb-2">
             <GraduationCap size={24} className={isCyber ? 'text-[#FF0000]' : themeConfig.styles.accentText} />
             <h3 className="text-lg font-bold uppercase tracking-wider" style={labelStyle}>{t.about.education}</h3>
          </div>
          <p className="text-lg md:text-xl font-medium leading-snug">
            {translateDynamic(data.education) || "Student of Land Information Tech"}
          </p>
        </div>

        {/* Location */}
        <div className={containerClasses} style={containerStyle}>
          <div className="flex items-center gap-3 mb-2">
             <MapPin size={24} className={isCyber ? 'text-[#FF0000]' : themeConfig.styles.accentText} />
             <h3 className="text-lg font-bold uppercase tracking-wider" style={labelStyle}>{t.about.location}</h3>
          </div>
          <p className="text-lg md:text-xl font-medium leading-snug">
            {translateDynamic(data.location) || "Rajshahi, Bangladesh"}
          </p>
        </div>

        {/* Email */}
        <div className={containerClasses} style={containerStyle}>
          <div className="flex items-center gap-3 mb-2">
             <Mail size={24} className={isCyber ? 'text-[#FF0000]' : themeConfig.styles.accentText} />
             <h3 className="text-lg font-bold uppercase tracking-wider" style={labelStyle}>{t.about.email}</h3>
          </div>
          <p className="text-base md:text-lg font-medium break-all">
            {data.email || "sakibulhasansami863@gmail.com"}
          </p>
        </div>

      </div>

      {/* 5. LONG BIOGRAPHY CONTAINER */}
      <div className={containerClasses} style={containerStyle}>
        <div className="flex items-center gap-3 mb-4">
           <User size={24} className={isCyber ? 'text-[#FF0000]' : themeConfig.styles.accentText} />
           <h3 className="text-xl font-bold uppercase tracking-wider" style={labelStyle}>{t.about.bio}</h3>
        </div>
        <div className={`text-sm md:text-base leading-loose whitespace-pre-line ${isCyber ? 'text-red-100' : themeConfig.styles.textSecondary}`}>
          {translateDynamic(data.longBio) || "Detailed biography information will appear here..."}
        </div>
      </div>

    </div>
  );
};

export default About;
                                                                                                

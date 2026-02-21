
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeConfig } from '../types';
import { fetchSettings } from '../services/firebase';

const themes: Record<Theme, ThemeConfig> = {
  'Liquid OS': {
    name: 'Liquid OS',
    styles: {
      appBg: 'liquid-bg',
      navBg: 'bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
      textMain: 'text-slate-800 font-medium tracking-tight',
      textSecondary: 'text-slate-500 font-normal',
      cardBg: 'bg-white/10 backdrop-blur-[50px] border border-white/40 hover:bg-white/20 transition-all duration-500',
      accentBg: 'bg-indigo-500/80 backdrop-blur-md hover:bg-indigo-600',
      accentText: 'text-indigo-600 font-semibold',
      border: 'border-white/30',
      font: 'font-sans',
      button: 'bg-white/20 backdrop-blur-md border border-white/30 text-indigo-700 hover:bg-white/40 hover:scale-105',
      radius: 'rounded-[2rem]',
      shadow: 'shadow-2xl shadow-indigo-500/10',
      navIconHover: 'hover:text-cyan-500'
    }
  },
  'BD Theme': {
    name: 'BD Theme',
    styles: {
      appBg: 'bd-liquid-bg',
      navBg: 'bg-[#006a4e]/20 backdrop-blur-[40px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
      textMain: 'text-white font-medium tracking-tight drop-shadow-sm',
      textSecondary: 'text-gray-200 font-normal',
      cardBg: 'bg-[#006a4e]/20 backdrop-blur-[50px] border border-white/10 hover:border-[#f42a41]/40 hover:bg-[#006a4e]/30 transition-all duration-500',
      accentBg: 'bg-[#f42a41] hover:bg-[#d12436]',
      accentText: 'text-[#f42a41] font-bold',
      border: 'border-white/10',
      font: 'font-sans',
      button: 'bg-[#f42a41]/90 backdrop-blur-md border border-[#f42a41] text-white hover:bg-[#f42a41] hover:scale-105 shadow-lg shadow-red-500/20',
      radius: 'rounded-[2rem]',
      shadow: 'shadow-2xl shadow-green-900/30',
      navIconHover: 'hover:text-[#f42a41]'
    }
  },
  'Cyber OS': {
    name: 'Cyber OS',
    styles: {
      appBg: 'cyber-mode',
      navBg: 'bg-black/95 border-b border-[#00FF41]/30',
      textMain: 'text-[#00FF41]',
      textSecondary: 'text-[#00AA22]',
      cardBg: 'bg-black border border-[#00FF41]/30 hover:border-[#00FF41] hover:bg-[#00FF41]/5 transition-all duration-100 cyber-clip',
      accentBg: 'bg-[#00FF41] hover:bg-[#00CC33]',
      accentText: 'text-[#FF0055]',
      border: 'border-[#00FF41]/30',
      font: 'font-mono',
      button: 'bg-black text-[#00FF41] border border-[#00FF41] hover:bg-[#00FF41] hover:text-black transition-none',
      radius: 'rounded-none',
      shadow: 'shadow-none',
      navIconHover: 'hover:text-[#FF0055]'
    }
  },
  'Sakura OS': {
    name: 'Sakura OS',
    styles: {
      appBg: 'bg-[#fff5f7]',
      navBg: 'bg-white/80 border-b border-pink-200 backdrop-blur-sm',
      textMain: 'text-stone-800',
      textSecondary: 'text-stone-500',
      cardBg: 'bg-white border border-pink-100 hover:shadow-lg hover:shadow-pink-100/50',
      accentBg: 'bg-pink-400 hover:bg-pink-300',
      accentText: 'text-pink-500',
      border: 'border-pink-200',
      font: 'font-serif',
      button: 'bg-pink-400 text-white hover:bg-pink-300',
      radius: 'rounded-lg',
      shadow: 'shadow-sm',
      navIconHover: 'hover:text-pink-500'
    }
  },
  'AMOLED OS': {
    name: 'AMOLED OS',
    styles: {
      appBg: 'bg-black',
      navBg: 'bg-black border-b border-white/20',
      textMain: 'text-white',
      textSecondary: 'text-neutral-500',
      cardBg: 'bg-neutral-900 border border-neutral-800 hover:border-white transition-colors',
      accentBg: 'bg-white hover:bg-gray-200',
      accentText: 'text-white font-bold',
      border: 'border-neutral-800',
      font: 'font-sans',
      button: 'bg-white text-black hover:bg-gray-200',
      radius: 'rounded-2xl',
      shadow: 'shadow-none',
      navIconHover: 'hover:text-white'
    }
  },
  'Retro OS': {
    name: 'Retro OS',
    styles: {
      appBg: 'bg-[#e0dcd5]',
      navBg: 'bg-[#c0b8ac] border-b-4 border-black',
      textMain: 'text-black',
      textSecondary: 'text-gray-600',
      cardBg: 'bg-[#c0b8ac] border-2 border-black shadow-[4px_4px_0_0_#000]',
      accentBg: 'bg-[#ff7e5f] hover:bg-[#ff6b4a]',
      accentText: 'text-[#d32f2f]',
      border: 'border-black',
      font: 'font-pixel text-xs md:text-sm',
      button: 'bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-1 active:shadow-none',
      radius: 'rounded-none',
      shadow: 'shadow-none',
      navIconHover: 'hover:text-[#d32f2f]'
    }
  },
  'Minimal OS': {
    name: 'Minimal OS',
    styles: {
      appBg: 'bg-[#FAFAFA]',
      navBg: 'bg-white border-b border-gray-100',
      textMain: 'text-gray-900',
      textSecondary: 'text-gray-400',
      cardBg: 'bg-white border border-gray-100 hover:border-gray-300 transition-colors',
      accentBg: 'bg-black hover:bg-gray-800',
      accentText: 'text-black',
      border: 'border-gray-100',
      font: 'font-sans',
      button: 'bg-black text-white hover:bg-gray-800',
      radius: 'rounded-md',
      shadow: 'shadow-sm',
      navIconHover: 'hover:text-black'
    }
  },
  'Toxic OS': {
    name: 'Toxic OS',
    styles: {
      appBg: 'bg-[#1a0b2e]',
      navBg: 'bg-[#2d1b4e] border-b border-[#76ff03]',
      textMain: 'text-[#76ff03]',
      textSecondary: 'text-[#d500f9]',
      cardBg: 'bg-[#2d1b4e]/80 border-2 border-[#d500f9] hover:border-[#76ff03] hover:shadow-[0_0_15px_#76ff03]',
      accentBg: 'bg-[#76ff03] hover:bg-[#64dd17]',
      accentText: 'text-[#76ff03]',
      border: 'border-[#d500f9]',
      font: 'font-tech',
      button: 'bg-[#76ff03] text-black font-bold hover:bg-[#b2ff59]',
      radius: 'rounded-xl',
      shadow: 'shadow-[0_0_10px_rgba(118,255,3,0.3)]',
      navIconHover: 'hover:text-[#d500f9]'
    }
  },
  'Nordic OS': {
    name: 'Nordic OS',
    styles: {
      appBg: 'bg-[#ECEFF4]',
      navBg: 'bg-[#E5E9F0] border-b border-[#D8DEE9]',
      textMain: 'text-[#2E3440]',
      textSecondary: 'text-[#4C566A]',
      cardBg: 'bg-white border border-[#E5E9F0] hover:shadow-md',
      accentBg: 'bg-[#88C0D0] hover:bg-[#81A1C1]',
      accentText: 'text-[#5E81AC]',
      border: 'border-[#E5E9F0]',
      font: 'font-sans',
      button: 'bg-[#5E81AC] text-white hover:bg-[#4C566A]',
      radius: 'rounded',
      shadow: 'shadow-sm',
      navIconHover: 'hover:text-[#5E81AC]'
    }
  },
  'Sunset OS': {
    name: 'Sunset OS',
    styles: {
      appBg: 'bg-gradient-to-br from-[#f6d365] to-[#fda085]',
      navBg: 'bg-white/30 backdrop-blur-md border-b border-white/40',
      textMain: 'text-[#6d214f]',
      textSecondary: 'text-[#b33771]',
      cardBg: 'bg-white/40 backdrop-blur-lg border border-white/50 hover:bg-white/60',
      accentBg: 'bg-[#fd79a8] hover:bg-[#e84393]',
      accentText: 'text-[#d63031]',
      border: 'border-white/40',
      font: 'font-sans',
      button: 'bg-gradient-to-r from-[#ff9a9e] to-[#fad0c4] text-white shadow-lg hover:shadow-xl',
      radius: 'rounded-3xl',
      shadow: 'shadow-lg shadow-orange-500/20',
      navIconHover: 'hover:text-[#d63031]'
    }
  },
  'Deep Sea OS': {
    name: 'Deep Sea OS',
    styles: {
      appBg: 'bg-[#001e3c]',
      navBg: 'bg-[#0a1929] border-b border-[#1e4976]',
      textMain: 'text-[#90caf9]',
      textSecondary: 'text-[#64b5f6]',
      cardBg: 'bg-[#0a1929] border border-[#132f4c] hover:border-[#42a5f5]',
      accentBg: 'bg-[#2196f3] hover:bg-[#1976d2]',
      accentText: 'text-[#42a5f5]',
      border: 'border-[#132f4c]',
      font: 'font-sans',
      button: 'bg-[#1e4976] text-white hover:bg-[#2196f3]',
      radius: 'rounded-lg',
      shadow: 'shadow-lg shadow-black/40',
      navIconHover: 'hover:text-[#42a5f5]'
    }
  },
  'Matrix OS': {
    name: 'Matrix OS',
    styles: {
      appBg: 'bg-matrix',
      navBg: 'bg-black border-b border-green-800',
      textMain: 'text-green-500',
      textSecondary: 'text-green-900',
      cardBg: 'bg-black border border-green-900 hover:border-green-500',
      accentBg: 'bg-green-900 hover:bg-green-800',
      accentText: 'text-green-400 font-bold',
      border: 'border-green-900',
      font: 'font-terminal',
      button: 'bg-black text-green-500 border border-green-500 hover:bg-green-900',
      radius: 'rounded-none',
      shadow: 'shadow-none',
      navIconHover: 'hover:text-green-400'
    }
  },
  'Glass OS': {
    name: 'Glass OS',
    styles: {
      appBg: 'bg-gradient-to-tr from-[#4158D0] via-[#C850C0] to-[#FFCC70]',
      navBg: 'bg-white/10 backdrop-blur-xl border-b border-white/20',
      textMain: 'text-white',
      textSecondary: 'text-white/80',
      cardBg: 'bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20',
      accentBg: 'bg-white/30 hover:bg-white/40',
      accentText: 'text-white font-bold tracking-wider',
      border: 'border-white/20',
      font: 'font-sans',
      button: 'bg-white/20 border border-white/30 text-white hover:bg-white/30',
      radius: 'rounded-2xl',
      shadow: 'shadow-2xl shadow-purple-500/20',
      navIconHover: 'hover:text-yellow-300'
    }
  }
};

interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('Liquid OS');

  // Load theme from Firebase settings on mount
  useEffect(() => {
    const initTheme = async () => {
      try {
        const settings = await fetchSettings();
        // Ensure fetched theme is valid
        if (settings && settings.theme && themes[settings.theme]) {
          setTheme(settings.theme);
        } else {
           // Fallback to local storage if DB fails or first time load optimization
           const saved = localStorage.getItem('os_theme') as Theme;
           if(saved && themes[saved]) setTheme(saved);
        }
      } catch (e) {
        console.error("Failed to load theme config", e);
      }
    };
    initTheme();
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    if(themes[newTheme]) {
      setTheme(newTheme);
      // Persist locally for immediate reloads, but Admin will persist to DB
      localStorage.setItem('os_theme', newTheme);
    }
  };

  // Safe fallback to prevent crashes if theme state is somehow invalid
  const currentThemeConfig = themes[theme] || themes['Liquid OS'];

  return (
    <ThemeContext.Provider value={{ theme, themeConfig: currentThemeConfig, setTheme: handleSetTheme }}>
      <div className={`min-h-screen transition-all duration-700 ease-in-out ${currentThemeConfig.styles.appBg} ${currentThemeConfig.styles.font} ${currentThemeConfig.styles.textMain}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
      

export interface Photo {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  tag: string;
}

export interface Writing {
  id: string;
  title: string;
  category: string;
  cover_url: string;
  pdfUrl: string;
  summary: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  tags: string[];
  imageUrls: string[]; // Array of 3 images
  link: string; // Detail/Work link
  description?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  iconClass: string; // e.g. "fa-brands fa-facebook"
}

// 🔴 NEW: Comment Interface (For Home, Projects, Writings & Photos)
export interface Comment {
  id: string;
  itemId: string; // 'home' for home page, or specific Photo/Project/Writing ID
  name: string;
  email: string;
  message: string;
  isApproved: boolean; // True only if admin approves
  isPinned: boolean; // True to show on the top/front
  createdAt: number; // Timestamp for sorting
}

export type AnimationType = 
  | 'anim-static' 
  | 'anim-neon-pulse'
  | 'anim-rgb-ring'
  | 'anim-hologram'
  | 'anim-morph'
  | 'anim-orbital'
  | 'anim-scanner'
  | 'anim-aurora'
  | 'anim-cyber-spin'
  | 'anim-border-flow'
  | 'anim-glitch'
  | 'anim-ramadan'      // New Special
  | 'anim-bijoy'        // New Special
  | 'anim-canvas-particles'
  | 'anim-canvas-links'
  | 'anim-canvas-matrix'
  | 'anim-canvas-dna'
  | 'anim-canvas-network'
  | 'anim-canvas-ramadan' // New Special
  | 'anim-canvas-bijoy';  // New Special

export type Theme = 
  | 'Liquid OS' 
  | 'BD Theme'
  | 'Cyber OS' 
  | 'Sakura OS' 
  | 'AMOLED OS' 
  | 'Retro OS' 
  | 'Minimal OS' 
  | 'Toxic OS' 
  | 'Nordic OS' 
  | 'Sunset OS' 
  | 'Deep Sea OS' 
  | 'Matrix OS' 
  | 'Glass OS'
  | 'Cotton Candy OS' 
  | 'Matcha OS';      

export interface Settings {
  bio: string;
  longBio: string;
  education: string;
  location: string;
  email: string;
  whatsappNumber?: string; // 🔴 NEW: For Direct WhatsApp Message
  heroImageUrl: string;
  heroAnimation: AnimationType;
  heroBorderColor: string; 
  heroAnimColor: string;   
  heroAnimColor2: string;
  contentScale: number;
  // 🔴 UPDATED: Added popular language codes + 'string' so you can add ANY language later
  language: 'en' | 'bn' | 'ar' | 'hi' | 'es' | 'fr' | 'de' | 'zh-CN' | 'ja' | 'ru' | 'pt' | 'it' | 'ko' | 'tr' | 'ur' | string;
  theme: Theme; 
  socialLinks: SocialLink[]; 
}

export interface ThemeConfig {
  name: Theme;
  styles: {
    appBg: string;
    navBg: string;
    textMain: string;
    textSecondary: string;
    cardBg: string;
    accentBg: string;
    accentText: string;
    border: string;
    font: string;
    button: string;
    radius: string;
    shadow: string;
    navIconHover: string; 
  };
}

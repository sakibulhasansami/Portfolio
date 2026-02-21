
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { addPhoto, addWriting, addProject, updateSettings, fetchSettings } from '../services/firebase';
import { Lock, LogOut, Save, Loader2, Monitor, Plus, Trash2, Image as ImageIcon, Book, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import { AnimationType, Theme, Settings, SocialLink } from '../types';

const Admin: React.FC = () => {
  const { themeConfig, setTheme, theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'gallery' | 'library' | 'projects'>('general');
  
  // Forms
  const [photoForm, setPhotoForm] = useState({ title: '', category: '', imageUrl: '', tag: '' });
  const [writingForm, setWritingForm] = useState({ title: '', category: '', cover_url: '', pdfUrl: '', summary: '' });
  const [projectForm, setProjectForm] = useState({ 
    title: '', 
    category: '', 
    tags: '', // comma separated 
    img1: '', img2: '', img3: '', // 3 separate inputs
    link: '', 
    description: '' 
  });

  const [settings, setSettings] = useState<Settings>({
    bio: '',
    longBio: '',
    education: '',
    location: '',
    email: '',
    heroImageUrl: '',
    heroAnimation: 'anim-static',
    heroBorderColor: '#000000',
    heroAnimColor: '#06b6d4',
    heroAnimColor2: '#ec4899',
    contentScale: 1,
    language: 'bn',
    theme: 'Liquid OS',
    socialLinks: []
  });

  const [newSocial, setNewSocial] = useState<SocialLink>({ platform: '', url: '', iconClass: '' });

  const animationOptions: AnimationType[] = [
    'anim-static', 
    'anim-neon-pulse', 'anim-rgb-ring', 'anim-hologram', 
    'anim-morph', 'anim-orbital', 'anim-scanner',
    'anim-aurora', 'anim-cyber-spin', 'anim-border-flow', 'anim-glitch',
    'anim-ramadan', 'anim-bijoy', // New Specials
    'anim-canvas-particles', 'anim-canvas-links', 
    'anim-canvas-matrix', 'anim-canvas-dna', 'anim-canvas-network',
    'anim-canvas-ramadan', 'anim-canvas-bijoy' // New Canvas Specials
  ];

  const themeOptions: Theme[] = [
    'Liquid OS', 'BD Theme', 'Cyber OS', 'Sakura OS', 'AMOLED OS', 'Retro OS', 
    'Minimal OS', 'Toxic OS', 'Nordic OS', 'Sunset OS', 'Deep Sea OS', 
    'Matrix OS', 'Glass OS'
  ];

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
    fetchSettings().then(fetchedSettings => {
      if (fetchedSettings) {
         // Auto-populate defaults if empty so user can edit them
         if (!fetchedSettings.socialLinks || fetchedSettings.socialLinks.length === 0) {
            fetchedSettings.socialLinks = [
              { platform: 'Facebook', url: '', iconClass: 'fa-brands fa-facebook' },
              { platform: 'Instagram', url: '', iconClass: 'fa-brands fa-instagram' },
              { platform: 'LinkedIn', url: '', iconClass: 'fa-brands fa-linkedin' }
            ];
         }
         // Ensure theme is set correctly from DB
         if (fetchedSettings.theme) {
            setTheme(fetchedSettings.theme);
         }
         setSettings(fetchedSettings);
      }
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setMessage('');
    } else {
      setMessage('Incorrect password. Try "admin123"');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPassword('');
  };

  // --- SUBMIT HANDLERS ---

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPhoto(photoForm);
      setMessage('Photo added successfully!');
      setPhotoForm({ title: '', category: '', imageUrl: '', tag: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding photo');
    }
  };

  const handleWritingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addWriting(writingForm);
      setMessage('Writing added successfully!');
      setWritingForm({ title: '', category: '', cover_url: '', pdfUrl: '', summary: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding writing');
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const images = [projectForm.img1, projectForm.img2, projectForm.img3].filter(url => url.length > 0);
      const tagsArray = projectForm.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      await addProject({
        title: projectForm.title,
        category: projectForm.category,
        tags: tagsArray,
        imageUrls: images,
        link: projectForm.link,
        description: projectForm.description
      });
      setMessage('Project added successfully!');
      setProjectForm({ title: '', category: '', tags: '', img1: '', img2: '', img3: '', link: '', description: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding project');
    }
  };

  const handleSettingsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure current theme in context is saved to settings
      const finalSettings = { ...settings, theme: theme };
      await updateSettings(finalSettings);
      setMessage('All Settings, Theme & Social Links updated!');
      const newSettings = await fetchSettings();
      if (newSettings) setSettings(newSettings);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- HELPER HANDLERS ---

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSocialLink = (index: number, key: keyof SocialLink, value: string) => {
    const updated = [...settings.socialLinks];
    updated[index] = { ...updated[index], [key]: value };
    setSettings(prev => ({ ...prev, socialLinks: updated }));
  };

  const addSocialLink = () => {
    if (newSocial.platform && newSocial.url) {
      const updated = [...(settings.socialLinks || []), newSocial];
      setSettings(prev => ({ ...prev, socialLinks: updated }));
      setNewSocial({ platform: '', url: '', iconClass: '' });
    }
  };

  const removeSocialLink = (index: number) => {
    const updated = settings.socialLinks.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, socialLinks: updated }));
  };

  const InputClass = `w-full p-2 ${themeConfig.styles.radius} mb-4 bg-transparent border ${themeConfig.styles.border} ${themeConfig.styles.textMain} focus:outline-none focus:border-opacity-100 placeholder-opacity-50`;
  const LabelClass = `block mb-1 text-sm font-bold ${themeConfig.styles.accentText}`;
  const TabButtonClass = (isActive: boolean) => 
    `flex items-center gap-2 px-4 py-2 rounded-t-lg font-bold transition-all ${isActive ? `${themeConfig.styles.cardBg} border-t border-x ${themeConfig.styles.border} border-b-0` : `opacity-60 hover:opacity-100 hover:bg-black/5`}`;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-md p-8 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} backdrop-blur-xl shadow-2xl`}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`p-4 rounded-full mb-4 ${themeConfig.styles.accentBg} text-white bg-opacity-20`}>
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className={`text-sm mt-2 ${themeConfig.styles.textSecondary}`}>
              Restricted area. Please identify yourself.
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Enter Password" required className={InputClass} value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            {message && <div className="mb-4 text-sm text-red-500 text-center font-medium">{message}</div>}
            <button type="submit" className={`w-full py-3 ${themeConfig.styles.radius} font-bold transition-transform active:scale-95 ${themeConfig.styles.button}`}>Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className={`flex items-center gap-2 px-4 py-2 ${themeConfig.styles.radius} border ${themeConfig.styles.border} hover:bg-red-500/10 text-red-500 transition-colors`}>
          <LogOut size={18} /><span>Logout</span>
        </button>
      </div>

      {message && <div className={`p-4 mb-6 ${themeConfig.styles.radius} ${themeConfig.styles.accentBg} text-white animate-fade-in`}>{message}</div>}

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-500/30 mb-6">
        <button onClick={() => setActiveTab('general')} className={TabButtonClass(activeTab === 'general')}>
          <SettingsIcon size={18} /> General
        </button>
        <button onClick={() => setActiveTab('gallery')} className={TabButtonClass(activeTab === 'gallery')}>
          <ImageIcon size={18} /> Gallery
        </button>
        <button onClick={() => setActiveTab('library')} className={TabButtonClass(activeTab === 'library')}>
          <Book size={18} /> Writings
        </button>
        <button onClick={() => setActiveTab('projects')} className={TabButtonClass(activeTab === 'projects')}>
          <Briefcase size={18} /> Projects
        </button>
      </div>

      {/* --- GENERAL SETTINGS TAB --- */}
      {activeTab === 'general' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <section className={`p-6 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border}`}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-current opacity-50">Profile Settings</h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div><label className={LabelClass}>Hero Image URL</label><input type="text" value={settings.heroImageUrl} onChange={e => updateSetting('heroImageUrl', e.target.value)} className={InputClass} /></div>
              <div><label className={LabelClass}>Short Bio</label><textarea value={settings.bio} onChange={e => updateSetting('bio', e.target.value)} className={InputClass + " h-20"} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={LabelClass}>Education</label><input type="text" value={settings.education} onChange={e => updateSetting('education', e.target.value)} className={InputClass} /></div>
                <div><label className={LabelClass}>Location</label><input type="text" value={settings.location} onChange={e => updateSetting('location', e.target.value)} className={InputClass} /></div>
              </div>
              <div><label className={LabelClass}>Email</label><input type="text" value={settings.email} onChange={e => updateSetting('email', e.target.value)} className={InputClass} /></div>
              <div><label className={LabelClass}>Long Biography</label><textarea value={settings.longBio} onChange={e => updateSetting('longBio', e.target.value)} className={InputClass + " h-40"} /></div>

              {/* Theme & Visuals */}
              <div className="pt-4 border-t border-gray-500/30">
                <h3 className="font-bold mb-3 opacity-80">Visuals</h3>
                <div className="mb-4">
                  <label className={LabelClass}>Theme (Site Wide)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(t => (
                      <button 
                        key={t} 
                        type="button" 
                        onClick={() => {
                          setTheme(t); 
                          updateSetting('theme', t);
                        }} 
                        className={`text-xs p-1 border ${theme === t ? 'bg-current text-black' : 'opacity-50 hover:opacity-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4"><label className={LabelClass}>Animation</label><select value={settings.heroAnimation} onChange={e => updateSetting('heroAnimation', e.target.value)} className={InputClass + " appearance-none text-black"}>{animationOptions.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                
                {/* NEW COLOR PICKERS */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={LabelClass}>Border Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.heroBorderColor || '#000000'} onChange={e => updateSetting('heroBorderColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                      <input type="text" value={settings.heroBorderColor} onChange={e => updateSetting('heroBorderColor', e.target.value)} className={`${InputClass} mb-0 !w-auto flex-1 text-xs`} placeholder="#000000" />
                    </div>
                  </div>
                  <div>
                    <label className={LabelClass}>Anim Color 1</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.heroAnimColor || '#06b6d4'} onChange={e => updateSetting('heroAnimColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                      <input type="text" value={settings.heroAnimColor} onChange={e => updateSetting('heroAnimColor', e.target.value)} className={`${InputClass} mb-0 !w-auto flex-1 text-xs`} placeholder="#06b6d4" />
                    </div>
                  </div>
                  <div>
                    <label className={LabelClass}>Anim Color 2</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.heroAnimColor2 || '#ec4899'} onChange={e => updateSetting('heroAnimColor2', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                      <input type="text" value={settings.heroAnimColor2} onChange={e => updateSetting('heroAnimColor2', e.target.value)} className={`${InputClass} mb-0 !w-auto flex-1 text-xs`} placeholder="#ec4899" />
                    </div>
                  </div>
                </div>

                <div><label className={LabelClass}>DPI Scale: {settings.contentScale}</label><input type="range" min="0.8" max="1.3" step="0.05" value={settings.contentScale || 1} onChange={e => updateSetting('contentScale', parseFloat(e.target.value))} className="w-full" /></div>
              </div>

              <button type="submit" disabled={isSaving} className={`mt-4 px-4 py-3 ${themeConfig.styles.radius} w-full font-bold flex justify-center items-center gap-2 ${themeConfig.styles.button}`}>{isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save All Settings</button>
            </form>
          </section>

          {/* Social Links Manager */}
          <section className={`p-6 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border}`}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-current opacity-50">Social Media Links (Footer)</h2>
            <div className="space-y-2 mb-4">
              {settings.socialLinks?.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border border-gray-500/20 rounded bg-black/5">
                  <i className={`${link.iconClass} w-6 text-center`}></i>
                  <span className="font-bold text-sm w-20">{link.platform}</span>
                  <input 
                    type="text" 
                    value={link.url} 
                    onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                    className={`flex-1 bg-transparent border-b border-gray-500/50 focus:border-current outline-none text-xs px-1 ${themeConfig.styles.textMain}`}
                    placeholder="https://..."
                  />
                  <button type="button" onClick={() => removeSocialLink(idx)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            <div className="p-4 border border-gray-500/30 rounded mb-4">
              <h3 className="text-sm font-bold mb-2 opacity-70">Add New Link</h3>
              <div className="grid grid-cols-2 gap-2">
                 <input type="text" placeholder="Platform Name (e.g. Facebook)" value={newSocial.platform} onChange={e => setNewSocial({...newSocial, platform: e.target.value})} className={InputClass} />
                 <input type="text" placeholder="Icon Class (e.g. fa-brands fa-facebook)" value={newSocial.iconClass} onChange={e => setNewSocial({...newSocial, iconClass: e.target.value})} className={InputClass} />
              </div>
              <input type="text" placeholder="Full URL" value={newSocial.url} onChange={e => setNewSocial({...newSocial, url: e.target.value})} className={InputClass} />
              <button type="button" onClick={addSocialLink} className={`px-4 py-2 ${themeConfig.styles.radius} w-full ${themeConfig.styles.button} flex items-center justify-center gap-2`}><Plus size={16}/> Add Link</button>
            </div>
            
            {/* NEW SAVE BUTTON SPECIFICALLY FOR SOCIAL LINKS */}
            <button 
              type="button" 
              onClick={() => handleSettingsSubmit()} 
              disabled={isSaving}
              className={`w-full py-3 ${themeConfig.styles.radius} font-bold flex justify-center items-center gap-2 ${themeConfig.styles.button} hover:scale-100 shadow-md`}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Social Links
            </button>
          </section>
        </div>
      )}

      {/* --- GALLERY TAB --- */}
      {activeTab === 'gallery' && (
        <section className={`max-w-xl mx-auto p-6 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border}`}>
          <h2 className="text-xl font-bold mb-4">Add New Photo</h2>
          <form onSubmit={handlePhotoSubmit}>
            <input type="text" placeholder="Title" required className={InputClass} value={photoForm.title} onChange={e => setPhotoForm({...photoForm, title: e.target.value})} />
            <input type="text" placeholder="Category" required className={InputClass} value={photoForm.category} onChange={e => setPhotoForm({...photoForm, category: e.target.value})} />
            <input type="text" placeholder="Tag" required className={InputClass} value={photoForm.tag} onChange={e => setPhotoForm({...photoForm, tag: e.target.value})} />
            <input type="text" placeholder="Image URL" required className={InputClass} value={photoForm.imageUrl} onChange={e => setPhotoForm({...photoForm, imageUrl: e.target.value})} />
            <button type="submit" className={`px-4 py-2 ${themeConfig.styles.radius} w-full ${themeConfig.styles.button}`}>Add Photo</button>
          </form>
        </section>
      )}

      {/* --- WRITINGS TAB --- */}
      {activeTab === 'library' && (
        <section className={`max-w-xl mx-auto p-6 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border}`}>
          <h2 className="text-xl font-bold mb-4">Add New Writing</h2>
          <form onSubmit={handleWritingSubmit}>
            <input type="text" placeholder="Title" required className={InputClass} value={writingForm.title} onChange={e => setWritingForm({...writingForm, title: e.target.value})} />
            <input type="text" placeholder="Category" required className={InputClass} value={writingForm.category} onChange={e => setWritingForm({...writingForm, category: e.target.value})} />
            <input type="text" placeholder="Cover Image URL" required className={InputClass} value={writingForm.cover_url} onChange={e => setWritingForm({...writingForm, cover_url: e.target.value})} />
            <input type="text" placeholder="PDF/Read URL" required className={InputClass} value={writingForm.pdfUrl} onChange={e => setWritingForm({...writingForm, pdfUrl: e.target.value})} />
            <textarea placeholder="Summary" required className={InputClass + " h-24"} value={writingForm.summary} onChange={e => setWritingForm({...writingForm, summary: e.target.value})} />
            <button type="submit" className={`px-4 py-2 ${themeConfig.styles.radius} w-full ${themeConfig.styles.button}`}>Add Writing</button>
          </form>
        </section>
      )}

      {/* --- PROJECTS TAB --- */}
      {activeTab === 'projects' && (
        <section className={`max-w-2xl mx-auto p-6 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border}`}>
          <h2 className="text-xl font-bold mb-4">Add New Project</h2>
          <form onSubmit={handleProjectSubmit}>
            <input type="text" placeholder="Project Title" required className={InputClass} value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
            <input type="text" placeholder="Category (e.g. Web Dev, Survey)" required className={InputClass} value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})} />
            <input type="text" placeholder="Tags (comma separated: React, Firebase, AI)" required className={InputClass} value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags: e.target.value})} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
               <input type="text" placeholder="Image 1 (Cover)" required className={InputClass} value={projectForm.img1} onChange={e => setProjectForm({...projectForm, img1: e.target.value})} />
               <input type="text" placeholder="Image 2 (Detail)" className={InputClass} value={projectForm.img2} onChange={e => setProjectForm({...projectForm, img2: e.target.value})} />
               <input type="text" placeholder="Image 3 (Detail)" className={InputClass} value={projectForm.img3} onChange={e => setProjectForm({...projectForm, img3: e.target.value})} />
            </div>

            <input type="text" placeholder="Project Link (GitHub/Live)" required className={InputClass} value={projectForm.link} onChange={e => setProjectForm({...projectForm, link: e.target.value})} />
            <textarea placeholder="Description" required className={InputClass + " h-24"} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
            
            <button type="submit" className={`px-4 py-2 ${themeConfig.styles.radius} w-full ${themeConfig.styles.button}`}>Add Project</button>
          </form>
        </section>
      )}
    </div>
  );
};

export default Admin;

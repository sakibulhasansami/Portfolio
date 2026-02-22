import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// 🔴 NEW: fetchComments ar addComment import kora holo
import { fetchSettings, fetchComments, addComment } from '../services/firebase';
import { AnimationType, Comment } from '../types';
// 🔴 NEW: MessageSquare, Send, X icon gulo add kora holo
import { Image as ImageIcon, Book, Briefcase, User, MessageSquare, Send, X, Pin } from 'lucide-react';
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

  // 🔴 NEW: Comment States
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
      
      // 🔴 NEW: Fetch only 'home' page comments
      const fetchedComments = await fetchComments('home');
      setComments(fetchedComments);
    };
    loadData();
  }, [t]);

  // 🔴 NEW: Comment Submit Handler
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addComment({
        itemId: 'home',
        name: commentForm.name,
        email: commentForm.email,
        message: commentForm.message,
        isApproved: false, // Admin theke accept korle true hobe
        isPinned: false,
        createdAt: Date.now()
      });
      setSubmitMessage('Thanks! Your comment is waiting for approval.');
      setCommentForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitMessage('Error sending comment. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBoxStyle = (index: number) => {
    if (theme === 'Cyber OS') {
      const isRed = index === 1 || index === 2;
      const color = isRed ? '#FF0000' : '#00FF41';
      return { borderColor: color, color: color, boxShadow: 'none', backgroundColor: '#000000' };
    }
    return {}; 
  };

  const navBoxes = [
    { title: t.nav.gallery, path: '/gallery', icon: ImageIcon, desc: t.home.visuals },
    { title: t.nav.writings, path: '/writings', icon: Book, desc: t.home.stories },
    { title: t.nav.projects, path: '/projects', icon: Briefcase, desc: t.home.works },
    { title: t.nav.profile, path: '/about', icon: User, desc: t.home.identity },
  ];

  const InputClass = `w-full p-3 ${themeConfig.styles.radius} mb-3 bg-transparent border ${themeConfig.styles.border} ${themeConfig.styles.textMain} focus:outline-none focus:border-opacity-100 placeholder-opacity-50 text-sm`;

  // Filter approved and pinned comments
  const approvedComments = comments.filter(c => c.isApproved);
  const pinnedComments = approvedComments.filter(c => c.isPinned);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] w-full max-w-2xl mx-auto space-y-8 pb-10">

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
            <img src={heroImage || "https://picsum.photos/200"} alt="Profile" className="w-full h-full object-cover rounded-full" />
          </div>
          {theme === 'Cyber OS' && <div className="absolute -inset-2 rounded-full border border-[#00FF41]/30 animate-spin-slow pointer-events-none z-20"></div>}
        </div>

        <div className="space-y-3 px-4">
          <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight ${themeConfig.styles.textMain}`}>
            Sakibul Hasan Sami
          </h1>
          <p className={`text-sm md:text-base max-w-md mx-auto leading-relaxed ${themeConfig.styles.textSecondary} font-medium`}>
            {translateDynamic(bio)}
          </p>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 w-full px-4 sm:px-8">
        {navBoxes.map((box, idx) => {
          const cyberStyle = getBoxStyle(idx);
          return (
            <Link key={box.path} to={box.path} style={cyberStyle} className={`group relative flex flex-col items-center justify-center p-6 border transition-all duration-300 hover:scale-[1.02] active:scale-95 ${themeConfig.styles.radius} ${theme !== 'Cyber OS' ? `${themeConfig.styles.cardBg} ${themeConfig.styles.border} ${themeConfig.styles.textMain} ${themeConfig.styles.shadow}` : 'hover:bg-opacity-80'}`}>
              <box.icon size={28} className={`mb-3 transition-transform duration-300 group-hover:-translate-y-1 ${theme !== 'Cyber OS' ? themeConfig.styles.accentText : ''}`} style={theme === 'Cyber OS' ? { color: cyberStyle.color } : {}} />
              <span className="text-base font-bold tracking-wide">{box.title}</span>
              <span className="text-xs opacity-60 uppercase tracking-wider mt-1">{box.desc}</span>
            </Link>
          );
        })}
      </div>

      {/* 🔴 NEW: COMMENTS & GUESTBOOK SECTION */}
      <div className="relative z-10 w-full px-4 sm:px-8 mt-12">
        <div className={`p-6 border ${themeConfig.styles.cardBg} ${themeConfig.styles.border} ${themeConfig.styles.radius} ${themeConfig.styles.shadow}`}>
          <div className="flex items-center gap-2 border-b border-current opacity-80 pb-3 mb-6">
            <MessageSquare size={20} className={themeConfig.styles.accentText} />
            <h2 className={`text-xl font-bold ${themeConfig.styles.textMain}`}>Guestbook</h2>
          </div>

          {/* Pinned Comments Display */}
          {pinnedComments.length > 0 && (
            <div className="mb-8 space-y-4">
              {pinnedComments.map(comment => (
                <div key={comment.id} className={`p-4 border border-current border-opacity-20 rounded-lg relative overflow-hidden bg-black/5`}>
                  <Pin size={14} className={`absolute top-3 right-3 opacity-50 ${themeConfig.styles.accentText}`} />
                  <h4 className={`font-bold text-sm ${themeConfig.styles.textMain}`}>{comment.name}</h4>
                  <p className={`text-sm mt-1 opacity-80 ${themeConfig.styles.textSecondary}`}>{comment.message}</p>
                </div>
              ))}
              
              {/* Read All Button */}
              {approvedComments.length > pinnedComments.length && (
                <button 
                  onClick={() => setShowAllModal(true)}
                  className={`text-xs font-bold w-full text-center p-2 opacity-70 hover:opacity-100 transition-opacity ${themeConfig.styles.accentText}`}
                >
                  Read all {approvedComments.length} comments...
                </button>
              )}
            </div>
          )}

          {/* Leave a Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mt-4">
             <h3 className={`text-sm font-bold mb-3 opacity-80 ${themeConfig.styles.textMain}`}>Leave a message:</h3>
             <div className="grid grid-cols-2 gap-3">
                <input type="text" required placeholder="Your Name" className={InputClass} value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} />
                <input type="email" required placeholder="Your Email (Hidden)" className={InputClass} value={commentForm.email} onChange={e => setCommentForm({...commentForm, email: e.target.value})} />
             </div>
             <textarea required placeholder="Write your message here..." className={`${InputClass} h-24 resize-none`} value={commentForm.message} onChange={e => setCommentForm({...commentForm, message: e.target.value})} />
             
             {submitMessage && (
               <div className={`text-xs font-bold mb-3 ${submitMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                 {submitMessage}
               </div>
             )}

             <button type="submit" disabled={isSubmitting} className={`w-full py-3 flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 ${themeConfig.styles.radius} ${themeConfig.styles.button}`}>
               {isSubmitting ? 'Sending...' : <><Send size={16} /> Send Message</>}
             </button>
          </form>
        </div>
      </div>

      {/* 🔴 NEW: ALL COMMENTS MODAL */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto flex flex-col gap-4 border ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} ${themeConfig.styles.border} shadow-2xl`}>
            <div className="flex justify-between items-center border-b border-current opacity-80 pb-3 sticky top-0 bg-inherit z-10">
              <h2 className="text-xl font-bold">All Messages</h2>
              <button onClick={() => setShowAllModal(false)} className="p-1 hover:bg-black/10 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-4 mt-2">
              {approvedComments.map(comment => (
                <div key={comment.id} className="p-4 border border-current border-opacity-10 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm">{comment.name}</h4>
                    <span className="text-[10px] opacity-50">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-2 opacity-80">{comment.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;

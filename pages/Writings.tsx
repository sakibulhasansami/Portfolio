import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// 🔴 NEW: fetchComments, addComment added
import { fetchWritings, fetchComments, addComment } from '../services/firebase';
import { Writing, Comment } from '../types';
// 🔴 NEW: MessageSquare, Send added
import { X, BookOpen, Search, Filter, Share2, Check, MessageSquare, Send } from 'lucide-react';

const Writings: React.FC = () => {
  const { themeConfig } = useTheme();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [writings, setWritings] = useState<Writing[]>([]);
  const [filteredWritings, setFilteredWritings] = useState<Writing[]>([]);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // 🔴 NEW: Comment States for specific writing
  const [writingComments, setWritingComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchWritings().then(data => {
      setWritings(data);
      setFilteredWritings(data);

      const cats = Array.from(new Set(data.map(w => w.category))).filter(Boolean);
      setCategories(['All', ...cats]);

      // Deep Link Check
      const id = searchParams.get('id');
      if (id) {
        const item = data.find(w => w.id === id);
        if (item) {
          setSelectedWriting(item);
          loadComments(item.id); // 🔴 Load comments if deep linked
        }
      }

      setLoading(false);
    });
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = writings;
    if (selectedCategory !== 'All') result = result.filter(w => w.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => w.title.toLowerCase().includes(q) || w.summary.toLowerCase().includes(q));
    }
    setFilteredWritings(result);
  }, [searchQuery, selectedCategory, writings]);

  // 🔴 NEW: Load comments function
  const loadComments = async (writingId: string) => {
    const comments = await fetchComments(writingId);
    setWritingComments(comments.filter(c => c.isApproved)); // Show only approved ones
  };

  const openWriting = (writing: Writing) => {
    setSelectedWriting(writing);
    setSearchParams({ id: writing.id });
    loadComments(writing.id); // 🔴 Load comments on open
  };

  const closeWriting = () => {
    setSelectedWriting(null);
    setSearchParams({});
    setCopied(false);
    setWritingComments([]); // Clear comments
    setSubmitMessage('');
  };

  // 🔴 NEW: Handle Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWriting) return;
    setIsSubmitting(true);
    try {
      await addComment({
        itemId: selectedWriting.id, 
        name: commentForm.name,
        email: 'reader@library.com', // Hidden default for quick comments
        message: commentForm.message,
        isApproved: false, 
        isPinned: false,
        createdAt: Date.now()
      });
      setSubmitMessage('Comment sent for approval!');
      setCommentForm({ name: '', message: '' });
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      setSubmitMessage('Error sending comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedWriting) return;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: selectedWriting.title, text: `Read this: ${selectedWriting.title}`, url: url }); } 
      catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{t.writings.title}</h1>
        <p className={themeConfig.styles.textSecondary}>{t.writings.subtitle}</p>
      </div>

       <div className={`mb-10 flex flex-col md:flex-row gap-4 p-4 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.shadow}`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-3 opacity-50 ${themeConfig.styles.textMain}`} size={20} />
          <input type="text" placeholder={t.writings.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2 ${themeConfig.styles.radius} bg-transparent border ${themeConfig.styles.border} focus:outline-none focus:border-current transition-colors`} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter size={20} className={`opacity-50 ${themeConfig.styles.textMain}`} />
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 ${themeConfig.styles.radius} text-sm whitespace-nowrap transition-colors ${selectedCategory === cat ? `${themeConfig.styles.accentBg} text-white` : `hover:bg-black/5 dark:hover:bg-white/10 ${themeConfig.styles.textMain}`}`}>
              {cat === 'All' ? t.gallery.all : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.styles.accentText}`}></div></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredWritings.map((writing) => (
            <div key={writing.id} onClick={() => openWriting(writing)} className={`cursor-pointer group ${themeConfig.styles.radius} overflow-hidden ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.shadow} transition-all hover:shadow-xl hover:-translate-y-2`}>
              <div className="aspect-[2/3] overflow-hidden"><img src={writing.cover_url} alt={writing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="p-4"><h3 className="font-bold text-lg leading-tight mb-1 truncate">{writing.title}</h3><p className={`text-xs uppercase tracking-wide opacity-70 ${themeConfig.styles.accentText}`}>{writing.category}</p></div>
            </div>
          ))}
          {filteredWritings.length === 0 && <div className={`col-span-full text-center py-20 ${themeConfig.styles.textSecondary}`}>{t.writings.noResults}</div>}
        </div>
      )}

      {/* 🔴 NEW: Updated Modal with Comments Section */}
      {selectedWriting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          {/* Changed max-w-4xl to max-w-5xl to accommodate comments side-by-side or below nicely */}
          <div className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto ${themeConfig.styles.radius} ${themeConfig.styles.appBg} ${themeConfig.styles.textMain} border ${themeConfig.styles.border} shadow-2xl flex flex-col md:flex-row custom-scrollbar`}>

            <button onClick={closeWriting} className={`absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 z-10 ${themeConfig.styles.textMain}`}><X size={20} /></button>

            {/* Left Column: Image */}
            <div className="md:w-1/3 bg-black/5 relative">
              <img src={selectedWriting.cover_url} alt={selectedWriting.title} className="w-full h-full object-cover min-h-[300px]" />
              {/* Optional: Add gradient overlay to make image look premium */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Right Column: Content & Comments */}
            <div className="p-6 md:p-8 md:w-2/3 flex flex-col w-full">
              <div className="mb-auto">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${themeConfig.styles.accentBg} text-white`}>{selectedWriting.category}</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{selectedWriting.title}</h2>
                <div className={`prose prose-sm max-w-none ${themeConfig.styles.textSecondary} mb-6 border-b border-current opacity-80 pb-6`}>
                  <p className="whitespace-pre-line leading-relaxed">{selectedWriting.summary}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-6">
                <button onClick={handleShare} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold border ${themeConfig.styles.border} hover:bg-black/5 dark:hover:bg-white/10 transition-colors w-1/3 text-sm`}>
                   {copied ? <Check size={18} /> : <Share2 size={18} />} {copied ? 'Copied' : 'Share'}
                </button>
                <a href={selectedWriting.pdfUrl} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-transform hover:scale-[1.02] active:scale-95 ${themeConfig.styles.button}`}>
                  <BookOpen size={18} /> {t.writings.read}
                </a>
              </div>

              {/* 🔴 NEW: Reader Comments Section */}
              <div className={`mt-2 p-4 ${themeConfig.styles.radius} bg-black/5 dark:bg-white/5 border border-current border-opacity-10`}>
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <MessageSquare size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Reader Thoughts ({writingComments.length})</h3>
                </div>

                {/* Display Comments */}
                <div className="max-h-32 overflow-y-auto pr-2 mb-4 space-y-3 custom-scrollbar">
                  {writingComments.length === 0 ? (
                    <p className="opacity-50 text-xs italic text-center py-2">No reviews yet. Be the first to share your thoughts!</p>
                  ) : (
                    writingComments.map(c => (
                      <div key={c.id} className="bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-current border-opacity-5">
                        <h4 className="text-xs font-bold opacity-90">{c.name}</h4>
                        <p className="text-sm mt-1 opacity-80">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input type="text" required placeholder="Name" value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} className={`w-full sm:w-1/3 px-3 py-2 text-sm bg-transparent border border-current border-opacity-20 focus:border-opacity-100 focus:outline-none ${themeConfig.styles.radius}`} />
                  <input type="text" required placeholder="Share your thoughts..." value={commentForm.message} onChange={e => setCommentForm({...commentForm, message: e.target.value})} className={`w-full flex-1 px-3 py-2 text-sm bg-transparent border border-current border-opacity-20 focus:border-opacity-100 focus:outline-none ${themeConfig.styles.radius}`} />
                  <button type="submit" disabled={isSubmitting} className={`px-4 py-2 font-bold flex items-center justify-center gap-2 ${themeConfig.styles.radius} border border-current border-opacity-20 hover:bg-current hover:text-black dark:hover:text-white transition-colors shrink-0`}>
                    {isSubmitting ? '...' : <><Send size={14}/> Post</>}
                  </button>
                </form>
                {submitMessage && <p className={`text-xs mt-2 text-center font-bold ${submitMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{submitMessage}</p>}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Writings;

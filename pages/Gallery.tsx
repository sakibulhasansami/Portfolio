import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// 🔴 NEW: Added fetchComments & addComment
import { fetchPhotos, fetchComments, addComment } from '../services/firebase';
import { Photo, Comment } from '../types';
// 🔴 NEW: Added MessageSquare, Send for comments
import { Search, Filter, X, Download, Tag, Share2, Check, MessageSquare, Send } from 'lucide-react';

const Gallery: React.FC = () => {
  const { themeConfig, theme } = useTheme(); // 🔴 Added theme for styling
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // Modal State
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [copied, setCopied] = useState(false);

  // 🔴 NEW: Comment States for specific photo
  const [photoComments, setPhotoComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchPhotos().then(data => {
      setPhotos(data);
      setFilteredPhotos(data);

      const cats = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
      setCategories(['All', ...cats]);

      const id = searchParams.get('id');
      if (id) {
        const linkedPhoto = data.find(p => p.id === id);
        if (linkedPhoto) {
          setSelectedPhoto(linkedPhoto);
          loadComments(linkedPhoto.id); // 🔴 Load comments for linked photo
        }
      }

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = photos;
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
    }
    setFilteredPhotos(result);
  }, [searchQuery, selectedCategory, photos]);

  // 🔴 NEW: Load comments for a specific photo
  const loadComments = async (photoId: string) => {
    const comments = await fetchComments(photoId);
    setPhotoComments(comments.filter(c => c.isApproved)); // Show only approved ones
  };

  const openPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setSearchParams({ id: photo.id });
    loadComments(photo.id); // 🔴 Load comments when modal opens
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    setSearchParams({});
    setCopied(false);
    setPhotoComments([]); // Clear comments
    setSubmitMessage('');
  };

  // 🔴 NEW: Handle Comment Submission for Photo
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;
    setIsSubmitting(true);
    try {
      await addComment({
        itemId: selectedPhoto.id, // Linked to this specific photo
        name: commentForm.name,
        email: 'hidden@gallery.com', // Not needed for simple photo comments
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

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${photo.title.replace(/\s+/g, '_')}_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not download image.");
    }
  };

  const handleShare = async (photo: Photo) => {
    const url = window.location.href; 
    if (navigator.share) {
      try { await navigator.share({ title: photo.title, text: `Check out this photo: ${photo.title}`, url: url }); } 
      catch (error) { console.log('Error sharing:', error); }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) { console.error('Failed to copy!', err); }
    }
  };

  return (
    <div className="min-h-screen py-6 md:py-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">{t.gallery.title}</h1>
        <p className={`text-sm ${themeConfig.styles.textSecondary}`}>{t.gallery.subtitle}</p>
      </div>

      <div className={`mb-6 flex flex-col md:flex-row gap-3 p-3 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.shadow}`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-2.5 opacity-50 ${themeConfig.styles.textMain}`} size={16} />
          <input type="text" placeholder={t.gallery.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 pr-4 py-2 text-sm ${themeConfig.styles.radius} bg-transparent border ${themeConfig.styles.border} focus:outline-none focus:border-current transition-colors`} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter size={16} className={`opacity-50 ${themeConfig.styles.textMain}`} />
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 ${themeConfig.styles.radius} text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? `${themeConfig.styles.accentBg} text-white` : `hover:bg-black/5 dark:hover:bg-white/10 ${themeConfig.styles.textMain}`}`}>
              {cat === 'All' ? t.gallery.all : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${themeConfig.styles.accentText}`}></div></div>
      ) : (
        <div className="columns-2 md:columns-4 lg:columns-5 gap-2 space-y-2">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} onClick={() => openPhoto(photo)} className={`break-inside-avoid group relative ${themeConfig.styles.radius} overflow-hidden cursor-pointer ${themeConfig.styles.cardBg} transition-all border ${themeConfig.styles.border}`}>
              <img src={photo.imageUrl} alt={photo.title} className="w-full h-auto block" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 translate-y-2 opacity-100 md:opacity-0 md:translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-white text-xs font-bold truncate">{photo.title}</h3>
                <div className="flex justify-between items-center mt-0.5"><span className="text-gray-300 text-[10px] flex items-center gap-1"><Tag size={10} /> {photo.tag}</span></div>
              </div>
            </div>
          ))}
          {filteredPhotos.length === 0 && <div className={`col-span-full text-center py-20 ${themeConfig.styles.textSecondary}`}>{t.gallery.noResults}</div>}
        </div>
      )}

      {/* 🔴 NEW: Updated Modal with Watermark & Comments */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in overflow-y-auto" onClick={closePhoto}>
          <div className="relative max-w-4xl w-full flex flex-col items-center my-auto" onClick={e => e.stopPropagation()}>
            <button onClick={closePhoto} className="absolute -top-10 right-0 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-50"><X size={24} /></button>

            {/* Photo Container with Watermark */}
            <div className="relative w-full flex justify-center group select-none">
              <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} className={`max-h-[60vh] w-auto object-contain ${themeConfig.styles.radius} shadow-2xl bg-black pointer-events-none`} />
              
              {/* 🔴 NEW: Watermark Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 mix-blend-overlay">
                <span className="text-white text-3xl md:text-5xl font-black tracking-widest uppercase rotate-[-30deg] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  © S-71 Studio
                </span>
              </div>
            </div>

            {/* Photo Details & Actions */}
            <div className={`w-full mt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white p-4 ${themeConfig.styles.radius} bg-white/10 backdrop-blur-sm border border-white/20`}>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold">{selectedPhoto.title}</h2>
                <div className="flex gap-3 mt-1 text-sm opacity-80 justify-center md:justify-start">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{selectedPhoto.category}</span>
                  <span className="flex items-center gap-1 text-xs"><Tag size={12} /> {selectedPhoto.tag}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleShare(selectedPhoto)} className={`flex items-center gap-2 px-4 py-2 ${themeConfig.styles.radius} font-bold border border-white/30 hover:bg-white/10 transition-colors text-sm`}>{copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? 'Copied' : 'Share'}</button>
                <button onClick={() => handleDownload(selectedPhoto)} className={`flex items-center gap-2 px-5 py-2 ${themeConfig.styles.radius} font-bold bg-white text-black hover:scale-105 transition-transform text-sm`}><Download size={16} /> Download</button>
              </div>
            </div>

            {/* 🔴 NEW: Comments Section for Photo */}
            <div className={`w-full mt-4 p-4 ${themeConfig.styles.radius} bg-white/5 backdrop-blur-md border border-white/10`}>
              <div className="flex items-center gap-2 mb-4 text-white opacity-90 border-b border-white/20 pb-2">
                <MessageSquare size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Comments ({photoComments.length})</h3>
              </div>

              {/* Display Comments */}
              <div className="max-h-40 overflow-y-auto pr-2 mb-4 space-y-3 custom-scrollbar">
                {photoComments.length === 0 ? (
                  <p className="text-white/50 text-xs italic text-center py-2">No comments yet. Be the first!</p>
                ) : (
                  photoComments.map(c => (
                    <div key={c.id} className="bg-white/10 p-3 rounded-lg border border-white/10">
                      <h4 className="text-white text-xs font-bold">{c.name}</h4>
                      <p className="text-white/80 text-sm mt-1">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="flex flex-col md:flex-row gap-2">
                <input type="text" required placeholder="Name" value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} className={`w-full md:w-1/3 px-3 py-2 text-sm bg-black/40 text-white border border-white/20 focus:border-white focus:outline-none ${themeConfig.styles.radius}`} />
                <input type="text" required placeholder="Write a comment..." value={commentForm.message} onChange={e => setCommentForm({...commentForm, message: e.target.value})} className={`w-full flex-1 px-3 py-2 text-sm bg-black/40 text-white border border-white/20 focus:border-white focus:outline-none ${themeConfig.styles.radius}`} />
                <button type="submit" disabled={isSubmitting} className={`px-4 py-2 bg-white text-black font-bold flex items-center justify-center gap-2 ${themeConfig.styles.radius} hover:scale-105 transition-transform shrink-0`}>
                  {isSubmitting ? '...' : <><Send size={14}/> Send</>}
                </button>
              </form>
              {submitMessage && <p className={`text-xs mt-2 text-center ${submitMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{submitMessage}</p>}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

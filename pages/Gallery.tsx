import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchPhotos, fetchComments, addComment } from '../services/firebase';
import { Photo, Comment } from '../types';
import { Search, Filter, X, Download, Tag, Share2, Check, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery: React.FC = () => {
  const { themeConfig } = useTheme();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [copied, setCopied] = useState(false);

  const [photoComments, setPhotoComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // 🔴 FIX: Extract Multiple Categories from Single String
  useEffect(() => {
    fetchPhotos().then(data => {
      setPhotos(data);
      setFilteredPhotos(data);

      // Extract all unique categories by splitting strings with comma
      const allCats = data.flatMap(p => 
        p.category ? p.category.split(',').map(cat => cat.trim()) : []
      );
      const uniqueCats = Array.from(new Set(allCats)).filter(Boolean);
      setCategories(['All', ...uniqueCats]);

      const id = searchParams.get('id');
      if (id) {
        const linkedPhoto = data.find(p => p.id === id);
        if (linkedPhoto) openPhoto(linkedPhoto);
      }
      setLoading(false);
    });
  }, []);

  // 🔴 FIX: Filter logic for multi-category
  useEffect(() => {
    let result = photos;
    if (selectedCategory !== 'All') {
      result = result.filter(p => 
        p.category && p.category.split(',').map(c => c.trim()).includes(selectedCategory)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.tag && p.tag.toLowerCase().includes(q))
      );
    }
    setFilteredPhotos(result);
  }, [searchQuery, selectedCategory, photos]);

  const loadComments = async (photoId: string) => {
    const comments = await fetchComments(photoId);
    setPhotoComments(comments.filter(c => c.isApproved));
  };

  const openPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setSearchParams({ id: photo.id });
    loadComments(photo.id);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    setSearchParams({});
    setCopied(false);
    setPhotoComments([]);
    setSubmitMessage('');
  };

  // 🔴 ENHANCEMENT: Next/Prev Navigation Logic
  const navigatePhoto = useCallback((direction: 'next' | 'prev') => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= filteredPhotos.length) newIndex = 0;
    if (newIndex < 0) newIndex = filteredPhotos.length - 1;

    openPhoto(filteredPhotos[newIndex]);
  }, [selectedPhoto, filteredPhotos]);

  // Keyboard Navigation Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === 'ArrowRight') navigatePhoto('next');
      if (e.key === 'ArrowLeft') navigatePhoto('prev');
      if (e.key === 'Escape') closePhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, navigatePhoto]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;
    setIsSubmitting(true);
    try {
      await addComment({
        itemId: selectedPhoto.id,
        name: commentForm.name,
        email: 'hidden@gallery.com',
        message: commentForm.message,
        isApproved: false, 
        isPinned: false,
        createdAt: Date.now()
      });
      setSubmitMessage('Sent for approval! ✅');
      setCommentForm({ ...commentForm, message: '' });
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
      link.download = `S71_${photo.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) { alert("Download failed."); }
  };

  const handleShare = async (photo: Photo) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${photo.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: photo.title, url: shareUrl }); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-6 md:py-10 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight italic">
          {t.gallery.title}
        </h1>
        <p className={`text-sm md:text-base opacity-70 ${themeConfig.styles.textSecondary}`}>
          {t.gallery.subtitle}
        </p>
      </div>

      {/* Filter Bar */}
      <div className={`mb-8 flex flex-col md:flex-row gap-4 p-4 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} backdrop-blur-md sticky top-4 z-30 shadow-xl`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
          <input 
            type="text" 
            placeholder={t.gallery.search} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className={`w-full pl-10 pr-4 py-2.5 text-sm ${themeConfig.styles.radius} bg-black/5 dark:bg-white/5 border ${themeConfig.styles.border} focus:ring-2 focus:ring-current transition-all`} 
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`px-4 py-2 ${themeConfig.styles.radius} text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat ? `${themeConfig.styles.accentBg} text-white shadow-lg scale-105` : `hover:bg-white/10 ${themeConfig.styles.textMain}`}`}
            >
              {cat === 'All' ? t.gallery.all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div></div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id} 
              onClick={() => openPhoto(photo)} 
              className={`break-inside-avoid group relative ${themeConfig.styles.radius} overflow-hidden cursor-none bg-zinc-900 transition-all hover:scale-[1.02] active:scale-95 shadow-lg`}
            >
              <img src={photo.imageUrl} alt={photo.title} className="w-full h-auto block opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white text-sm font-bold leading-tight mb-1">{photo.title}</h3>
                <span className="text-white/60 text-[10px] uppercase tracking-widest flex items-center gap-1"><Tag size={10} /> {photo.tag}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in" onClick={closePhoto}>
          
          {/* Navigation Controls */}
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }} className="absolute left-4 z-[110] p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all"><ChevronLeft size={32}/></button>
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }} className="absolute right-4 z-[110] p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all"><ChevronRight size={32}/></button>
          <button onClick={closePhoto} className="absolute top-6 right-6 z-[110] p-2 text-white/50 hover:text-white"><X size={30} /></button>

          <div className="max-w-5xl w-full h-full flex flex-col md:flex-row p-4 md:p-10 gap-6 overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
            
            {/* Left side: Image with Watermark */}
            <div className="flex-[2] flex items-center justify-center relative group">
              <img 
                src={selectedPhoto.imageUrl} 
                alt={selectedPhoto.title} 
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl animate-zoom-in" 
              />
              
              {/* 🔴 ENHANCEMENT: Full-Cover Subtle Watermark */}
              <div className="absolute inset-0 pointer-events-none flex flex-wrap gap-12 items-center justify-center overflow-hidden opacity-[0.08] select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="text-white text-xl font-bold uppercase rotate-[-30deg] whitespace-nowrap">
                    © S-71 Studio
                  </span>
                ))}
              </div>
            </div>

            {/* Right side: Info & Comments */}
            <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <h2 className="text-2xl font-black text-white mb-2 italic">{selectedPhoto.title}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPhoto.category.split(',').map(c => (
                    <span key={c} className="text-[10px] font-bold uppercase bg-white/20 text-white px-2 py-1 rounded-md tracking-tighter">{c.trim()}</span>
                  ))}
                </div>

                <div className="flex gap-3">
                   <button onClick={() => handleDownload(selectedPhoto)} className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Download size={18}/> Download</button>
                   <button onClick={() => handleShare(selectedPhoto)} className="p-3 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all">{copied ? <Check size={20}/> : <Share2 size={20}/>}</button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col max-h-[400px]">
                <div className="flex items-center gap-2 mb-4 text-white/70">
                  <MessageSquare size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Feedback ({photoComments.length})</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
                  {photoComments.length === 0 ? (
                    <p className="text-center text-white/30 text-xs py-10 italic">No thoughts yet...</p>
                  ) : (
                    photoComments.map(c => (
                      <div key={c.id} className="animate-fade-in bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-white/40 text-[10px] font-bold mb-1">{c.name}</p>
                        <p className="text-white/90 text-sm leading-relaxed">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-2">
                  <input required placeholder="Your Name" value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40" />
                  <div className="relative">
                    <input required placeholder="Say something..." value={commentForm.message} onChange={e => setCommentForm({...commentForm, message: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 pr-10" />
                    <button type="submit" disabled={isSubmitting} className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:scale-110 transition-transform">
                      {isSubmitting ? '...' : <Send size={16}/>}
                    </button>
                  </div>
                  {submitMessage && <p className="text-[10px] text-center text-green-400 animate-pulse">{submitMessage}</p>}
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

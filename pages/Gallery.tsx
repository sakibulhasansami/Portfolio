import React, { useEffect, useState, useCallback, useRef } from 'react';
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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // Modal & Comments
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoComments, setPhotoComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Gesture State
  const touchStart = useRef<number | null>(null);
  const swipeThreshold = 70; // 🔴 Sensitivity Fix: Minimum 70px move lagbe swipe hote

  useEffect(() => {
    fetchPhotos().then(data => {
      setPhotos(data);
      setFilteredPhotos(data);
      const allCats = data.flatMap(p => p.category ? p.category.split(',').map(c => c.trim()) : []);
      setCategories(['All', ...Array.from(new Set(allCats))]);

      const id = searchParams.get('id');
      if (id) {
        const linkedPhoto = data.find(p => p.id === id);
        if (linkedPhoto) openPhoto(linkedPhoto);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = photos;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.split(',').map(c => c.trim()).includes(selectedCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
    }
    setFilteredPhotos(result);
  }, [searchQuery, selectedCategory, photos]);

  const openPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setSearchParams({ id: photo.id });
    fetchComments(photo.id).then(c => setPhotoComments(c.filter(item => item.isApproved)));
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    setSearchParams({});
    setPhotoComments([]);
  };

  // 🔴 Advanced Navigation Logic
  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (!selectedPhoto) return;
    const idx = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    let nextIdx = dir === 'next' ? idx + 1 : idx - 1;
    if (nextIdx >= filteredPhotos.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = filteredPhotos.length - 1;
    openPhoto(filteredPhotos[nextIdx]);
  }, [selectedPhoto, filteredPhotos]);

  // 🔴 Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart.current - touchEnd;
    if (Math.abs(distance) > swipeThreshold) {
      distance > 0 ? navigate('next') : navigate('prev');
    }
    touchStart.current = null;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === 'Escape') closePhoto();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header & Filters */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-black mb-4 italic tracking-tighter uppercase">{t.gallery.title}</h1>
        <div className={`p-4 flex flex-col md:flex-row gap-4 ${themeConfig.styles.cardBg} ${themeConfig.styles.radius} border ${themeConfig.styles.border} backdrop-blur-lg`}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
            <input type="text" placeholder={t.gallery.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 pl-10 text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-20 animate-pulse">Loading S-71 Captures...</div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredPhotos.map(photo => (
            <div key={photo.id} onClick={() => openPhoto(photo)} className={`group relative ${themeConfig.styles.radius} overflow-hidden border ${themeConfig.styles.border} cursor-zoom-in`}>
              <img src={photo.imageUrl} alt={photo.title} className="w-full h-auto" loading="lazy" />
              {/* 🔴 Design Change: Info visible below/over with clearer UI */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-4 flex flex-col justify-end">
                <p className="text-white text-xs font-bold truncate">{photo.title}</p>
                <div className="flex gap-2 mt-1">
                   {photo.tag.split(' ').map(t => <span key={t} className="text-[8px] text-white/60">#{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          onClick={closePhoto}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Controls */}
          <button onClick={(e) => { e.stopPropagation(); navigate('prev'); }} className="hidden md:flex absolute left-8 top-1/2 p-3 bg-white/5 rounded-full hover:bg-white/20 text-white"><ChevronLeft size={32}/></button>
          <button onClick={(e) => { e.stopPropagation(); navigate('next'); }} className="hidden md:flex absolute right-8 top-1/2 p-3 bg-white/5 rounded-full hover:bg-white/20 text-white"><ChevronRight size={32}/></button>
          <button onClick={closePhoto} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32}/></button>

          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 h-full items-center justify-center no-scrollbar" onClick={e => e.stopPropagation()}>
            {/* Image Box */}
            <div className="flex-[2] relative flex justify-center">
              <img src={selectedPhoto.imageUrl} className="max-h-[75vh] rounded-lg shadow-2xl border border-white/10" alt="S71" />
              {/* Subtle Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
                <p className="text-white text-4xl font-black rotate-[-30deg]">© S-71 STUDIO</p>
              </div>
            </div>

            {/* Content Box */}
            <div className="flex-1 w-full max-w-sm bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex flex-col">
              <h2 className="text-xl font-black text-white italic">{selectedPhoto.title}</h2>
              <div className="flex flex-wrap gap-2 my-4">
                 {selectedPhoto.category.split(',').map(c => <span key={c} className="text-[9px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded font-bold uppercase">{c.trim()}</span>)}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 mb-6">
                <button onClick={() => {/* Download Logic */}} className="flex-1 py-2.5 bg-white text-black rounded-xl font-bold text-xs">Download</button>
                <button className="p-2.5 bg-white/10 text-white rounded-xl"><Share2 size={18}/></button>
              </div>

              {/* Feedback */}
              <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 space-y-3">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest border-b border-white/10 pb-1">Comments ({photoComments.length})</p>
                {photoComments.map(c => (
                  <div key={c.id} className="text-xs bg-white/5 p-2 rounded-lg">
                    <span className="font-bold block text-red-400 mb-1">{c.name}</span>
                    <span className="text-white/80">{c.message}</span>
                  </div>
                ))}
              </div>

              <form className="flex gap-2">
                <input placeholder="Say something..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                <button className="p-2 bg-red-600 rounded-xl text-white"><Send size={16}/></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

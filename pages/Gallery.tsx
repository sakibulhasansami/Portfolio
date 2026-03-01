import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchPhotos, fetchComments, addComment } from '../services/firebase';
import { Photo, Comment } from '../types';
import {
  Search, X, Download, Share2, Send,
  ChevronLeft, ChevronRight, ArrowLeft, Tag
} from 'lucide-react';

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

  // Gesture
  const touchStart = useRef<number | null>(null);
  const swipeThreshold = 70;

  useEffect(() => {
    fetchPhotos().then(data => {
      setPhotos(data);
      setFilteredPhotos(data);
      const allCats = data.flatMap(p =>
        p.category ? p.category.split(',').map(c => c.trim()) : []
      );
      setCategories(['All', ...Array.from(new Set(allCats))]);

      const id = searchParams.get('id');
      if (id) {
        const linked = data.find(p => p.id === id);
        if (linked) openPhoto(linked);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = photos;
    if (selectedCategory !== 'All') {
      result = result.filter(p =>
        p.category?.split(',').map(c => c.trim()).includes(selectedCategory)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
      );
    }
    setFilteredPhotos(result);
  }, [searchQuery, selectedCategory, photos]);

  const openPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setSearchParams({ id: photo.id });
    fetchComments(photo.id).then(c =>
      setPhotoComments(c.filter(item => item.isApproved))
    );
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    setSearchParams({});
    setPhotoComments([]);
  };

  const navigate = useCallback(
    (dir: 'next' | 'prev') => {
      if (!selectedPhoto) return;
      const idx = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
      let next = dir === 'next' ? idx + 1 : idx - 1;
      if (next >= filteredPhotos.length) next = 0;
      if (next < 0) next = filteredPhotos.length - 1;
      openPhoto(filteredPhotos[next]);
    },
    [selectedPhoto, filteredPhotos]
  );

  const handleTouchStart = (e: React.TouchEvent) =>
    (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dist = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dist) > swipeThreshold) dist > 0 ? navigate('next') : navigate('prev');
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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  const handleDownload = async () => {
    if (!selectedPhoto) return;
    const a = document.createElement('a');
    a.href = selectedPhoto.imageUrl;
    a.download = selectedPhoto.title || 'photo';
    a.target = '_blank';
    a.click();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto || !commentForm.name || !commentForm.message) return;
    setIsSubmitting(true);
    await addComment(selectedPhoto.id, commentForm.name, commentForm.message);
    setCommentForm({ name: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-black mb-2 italic tracking-tighter uppercase">
          {t.gallery?.title ?? 'Visual Gallery'}
        </h1>
        <p className="text-sm opacity-50 mb-6">A collection of moments frozen in time.</p>

        {/* Search Bar */}
        <div
          className={`p-3 flex flex-col md:flex-row gap-3 ${themeConfig.styles.cardBg} ${themeConfig.styles.radius} border ${themeConfig.styles.border} backdrop-blur-lg`}
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              size={16}
            />
            <input
              type="text"
              placeholder={t.gallery?.search ?? 'Search photos...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none focus:ring-0 pl-9 text-sm"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      {loading ? (
        <div className="flex justify-center py-20 animate-pulse text-sm opacity-50">
          Loading S-71 Captures...
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 max-w-7xl mx-auto">
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() => openPhoto(photo)}
              className={`group relative break-inside-avoid ${themeConfig.styles.radius} overflow-hidden border ${themeConfig.styles.border} cursor-pointer`}
            >
              {/* ✅ Natural aspect ratio — no forced height, no object-fit crop */}
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-auto block"
                loading="lazy"
              />

              {/* ✅ Always-visible bottom overlay with title + tags */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3">
                <p className="text-white text-xs font-bold leading-snug mb-1">
                  {photo.title}
                </p>
                <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                  {photo.tag
                    .split(' ')
                    .filter(Boolean)
                    .map(tag => (
                      <span key={tag} className="text-[9px] text-white/60 leading-tight">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex items-start md:items-center justify-center overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ✅ Back Button — top-left, always visible */}
          <button
            onClick={closePhoto}
            className="fixed top-4 left-4 z-[1001] flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Desktop Prev/Next */}
          <button
            onClick={e => { e.stopPropagation(); navigate('prev'); }}
            className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-[1001] p-3 bg-white/5 rounded-full hover:bg-white/20 text-white transition-all"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); navigate('next'); }}
            className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-[1001] p-3 bg-white/5 rounded-full hover:bg-white/20 text-white transition-all"
          >
            <ChevronRight size={28} />
          </button>

          {/* Content */}
          <div
            className="w-full max-w-5xl flex flex-col md:flex-row gap-6 p-4 pt-16 md:p-10 md:pt-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-[2] flex justify-center items-start">
              {/* ✅ Natural aspect ratio in modal too */}
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Info Panel */}
            <div className="flex-1 w-full bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-black text-white italic mb-3">
                  {selectedPhoto.title}
                </h2>

                {/* ✅ Category badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedPhoto.category
                    .split(',')
                    .map(c => (
                      <span
                        key={c}
                        className="text-[9px] bg-red-600/25 text-red-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide"
                      >
                        {c.trim()}
                      </span>
                    ))}
                </div>

                {/* ✅ Tags with # */}
                <div className="flex flex-wrap gap-1.5">
                  <Tag size={10} className="text-white/30 mt-0.5" />
                  {selectedPhoto.tag
                    .split(' ')
                    .filter(Boolean)
                    .map(tag => (
                      <span key={tag} className="text-[10px] text-white/50">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 transition"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className={`p-2.5 rounded-xl text-white transition ${copied ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20'}`}
                  title="Copy Link"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Comments */}
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest border-b border-white/10 pb-1 mb-2">
                  Comments ({photoComments.length})
                </p>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-40 pr-1">
                  {photoComments.length === 0 && (
                    <p className="text-xs text-white/30 italic text-center py-4">
                      No comments yet.
                    </p>
                  )}
                  {photoComments.map(c => (
                    <div key={c.id} className="text-xs bg-white/5 p-2 rounded-lg">
                      <span className="font-bold block text-red-400 mb-0.5">{c.name}</span>
                      <span className="text-white/70">{c.message}</span>
                    </div>
                  ))}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
                  <input
                    placeholder="Your name"
                    value={commentForm.name}
                    onChange={e => setCommentForm(p => ({ ...p, name: e.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/50"
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Say something..."
                      value={commentForm.message}
                      onChange={e => setCommentForm(p => ({ ...p, message: e.target.value }))}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
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

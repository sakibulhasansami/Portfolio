
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchWritings } from '../services/firebase';
import { Writing } from '../types';
import { X, BookOpen, Search, Filter, Share2, Check } from 'lucide-react';

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
        if (item) setSelectedWriting(item);
      }

      setLoading(false);
    });
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = writings;

    if (selectedCategory !== 'All') {
      result = result.filter(w => w.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.summary.toLowerCase().includes(q)
      );
    }

    setFilteredWritings(result);
  }, [searchQuery, selectedCategory, writings]);

  const openWriting = (writing: Writing) => {
    setSelectedWriting(writing);
    setSearchParams({ id: writing.id });
  };

  const closeWriting = () => {
    setSelectedWriting(null);
    setSearchParams({});
    setCopied(false);
  };

  const handleShare = async () => {
    if (!selectedWriting) return;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedWriting.title,
          text: `Read this: ${selectedWriting.title}`,
          url: url
        });
      } catch (e) {}
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

       {/* Search & Filter Bar */}
       <div className={`mb-10 flex flex-col md:flex-row gap-4 p-4 ${themeConfig.styles.radius} ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.shadow}`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-3 opacity-50 ${themeConfig.styles.textMain}`} size={20} />
          <input 
            type="text" 
            placeholder={t.writings.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${themeConfig.styles.radius} bg-transparent border ${themeConfig.styles.border} focus:outline-none focus:border-current transition-colors`}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter size={20} className={`opacity-50 ${themeConfig.styles.textMain}`} />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 ${themeConfig.styles.radius} text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? `${themeConfig.styles.accentBg} text-white` 
                  : `hover:bg-black/5 dark:hover:bg-white/10 ${themeConfig.styles.textMain}`
              }`}
            >
              {cat === 'All' ? t.gallery.all : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.styles.accentText}`}></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredWritings.map((writing) => (
            <div 
              key={writing.id} 
              onClick={() => openWriting(writing)}
              className={`cursor-pointer group ${themeConfig.styles.radius} overflow-hidden ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.shadow} transition-all hover:shadow-xl hover:-translate-y-2`}
            >
              <div className="aspect-[2/3] overflow-hidden">
                <img 
                  src={writing.cover_url} 
                  alt={writing.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg leading-tight mb-1 truncate">{writing.title}</h3>
                <p className={`text-xs uppercase tracking-wide opacity-70 ${themeConfig.styles.accentText}`}>{writing.category}</p>
              </div>
            </div>
          ))}
          {filteredWritings.length === 0 && (
             <div className={`col-span-full text-center py-20 ${themeConfig.styles.textSecondary}`}>
             {t.writings.noResults}
           </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedWriting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${themeConfig.styles.radius} ${themeConfig.styles.appBg} ${themeConfig.styles.textMain} shadow-2xl flex flex-col md:flex-row`}>
            
            <button 
              onClick={closeWriting}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 z-10"
            >
              <X size={20} />
            </button>

            <div className="md:w-1/3 bg-black/5">
              <img 
                src={selectedWriting.cover_url} 
                alt={selectedWriting.title} 
                className="w-full h-full object-cover min-h-[300px]"
              />
            </div>

            <div className="p-8 md:w-2/3 flex flex-col">
              <div className="mb-auto">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${themeConfig.styles.accentBg} text-white`}>
                  {selectedWriting.category}
                </span>
                <h2 className="text-3xl font-bold mb-6">{selectedWriting.title}</h2>
                <div className={`prose prose-sm max-w-none ${themeConfig.styles.textSecondary}`}>
                  <p className="whitespace-pre-line">{selectedWriting.summary}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/20 flex gap-4">
                <button 
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold border ${themeConfig.styles.border} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
                >
                   {copied ? <Check size={20} /> : <Share2 size={20} />} 
                   {copied ? 'Copied' : 'Share'}
                </button>

                <a 
                  href={selectedWriting.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${themeConfig.styles.button}`}
                >
                  <BookOpen size={20} />
                  {t.writings.read}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Writings;

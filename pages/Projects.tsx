import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// 🔴 NEW: fetchComments, addComment added
import { fetchProjects, fetchComments, addComment } from '../services/firebase';
import { Project, Comment } from '../types';
// 🔴 NEW: MessageSquare, Send added
import { Hammer, X, ExternalLink, Tag, Share2, Check, MessageSquare, Send } from 'lucide-react';

const Projects: React.FC = () => {
  const { themeConfig } = useTheme();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  // 🔴 NEW: Comment States for specific project
  const [projectComments, setProjectComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);

      // Deep Link Check
      const id = searchParams.get('id');
      if (id) {
        const item = data.find(p => p.id === id);
        if (item) {
          setSelectedProject(item);
          loadComments(item.id); // 🔴 Load comments if deep linked
        }
      }

      setLoading(false);
    });
  }, []);

  // 🔴 NEW: Load comments function
  const loadComments = async (projectId: string) => {
    const comments = await fetchComments(projectId);
    setProjectComments(comments.filter(c => c.isApproved)); // Show only approved ones
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setSearchParams({ id: project.id });
    loadComments(project.id); // 🔴 Load comments on open
  };

  const closeProject = () => {
    setSelectedProject(null);
    setSearchParams({});
    setCopied(false);
    setProjectComments([]); // Clear comments
    setSubmitMessage('');
  };

  // 🔴 NEW: Handle Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      await addComment({
        itemId: selectedProject.id, 
        name: commentForm.name,
        email: 'visitor@projects.com', // Hidden default
        message: commentForm.message,
        isApproved: false, 
        isPinned: false,
        createdAt: Date.now()
      });
      setSubmitMessage('Feedback sent for approval!');
      setCommentForm({ name: '', message: '' });
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      setSubmitMessage('Error sending feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedProject) return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedProject.title,
          text: `Check out this project: ${selectedProject.title}`,
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
        <h1 className="text-4xl font-bold mb-2">{t.projects.title}</h1>
        <p className={themeConfig.styles.textSecondary}>{t.projects.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.styles.accentText}`}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} onClick={() => openProject(project)} className={`group cursor-pointer ${themeConfig.styles.radius} overflow-hidden ${themeConfig.styles.cardBg} border ${themeConfig.styles.border} ${themeConfig.styles.shadow} transition-all hover:shadow-xl hover:-translate-y-2 flex flex-col`}>
              {/* Cover Image */}
              <div className="h-48 overflow-hidden relative">
                <img src={project.imageUrls[0] || "https://picsum.photos/400/300"} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm">
                    {t.projects.viewProject}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col">
                <div className="mb-2"><span className={`text-xs font-bold uppercase tracking-wider ${themeConfig.styles.accentText}`}>{project.category}</span></div>
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                {/* Tags Preview */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                     <span key={idx} className={`text-[10px] px-2 py-1 rounded bg-black/5 dark:bg-white/10 ${themeConfig.styles.textMain} opacity-70`}>#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
             <div className={`col-span-full flex flex-col items-center justify-center py-20 opacity-50 ${themeConfig.styles.textSecondary}`}>
                <Hammer size={48} className="mb-4" />
                <p>{t.projects.noResults}</p>
             </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className={`relative w-full max-w-6xl my-8 ${themeConfig.styles.radius} ${themeConfig.styles.appBg} ${themeConfig.styles.textMain} shadow-2xl border ${themeConfig.styles.border} flex flex-col overflow-hidden`}>

            {/* Close Button */}
            <button onClick={closeProject} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 z-20 transition-colors backdrop-blur-md text-white">
              <X size={24} />
            </button>

            {/* Content Container */}
            <div className="flex flex-col lg:flex-row h-full">

              {/* Images Column */}
              <div className="lg:w-1/2 bg-black/5 p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh] lg:max-h-[85vh] custom-scrollbar">
                 {selectedProject.imageUrls.map((img, idx) => (
                    <img key={idx} src={img} alt={`${selectedProject.title} ${idx + 1}`} className={`w-full h-auto object-contain shadow-md ${themeConfig.styles.radius}`} />
                 ))}
              </div>

              {/* Info & Comments Column */}
              <div className="lg:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[60vh] lg:max-h-[85vh] custom-scrollbar">
                
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${themeConfig.styles.accentBg} text-white`}>{selectedProject.category}</span>
                  <h2 className="text-3xl font-bold leading-tight">{selectedProject.title}</h2>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                   {selectedProject.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-current opacity-60"><Tag size={10} /> {tag}</div>
                   ))}
                </div>

                <div className={`prose prose-sm max-w-none mb-6 ${themeConfig.styles.textSecondary}`}>
                  <p className="whitespace-pre-line">{selectedProject.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-8">
                  <button onClick={handleShare} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold border ${themeConfig.styles.border} hover:bg-black/5 dark:hover:bg-white/10 transition-colors w-1/3 text-sm`}>
                     {copied ? <Check size={18} /> : <Share2 size={18} />} {copied ? 'Copied' : 'Share'}
                  </button>
                  <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center justify-center gap-2 py-3 text-center font-bold rounded-xl transition-transform hover:scale-[1.02] active:scale-95 ${themeConfig.styles.button}`}>
                    <span>{t.projects.visitLink}</span><ExternalLink size={18} />
                  </a>
                </div>

                {/* 🔴 NEW: Project Feedback / Comments Section */}
                <div className={`mt-auto p-4 ${themeConfig.styles.radius} bg-black/5 dark:bg-white/5 border border-current border-opacity-10`}>
                  <div className="flex items-center gap-2 mb-4 opacity-80">
                    <MessageSquare size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Feedback ({projectComments.length})</h3>
                  </div>

                  {/* Display Comments */}
                  <div className="max-h-40 overflow-y-auto pr-2 mb-4 space-y-3 custom-scrollbar">
                    {projectComments.length === 0 ? (
                      <p className="opacity-50 text-xs italic text-center py-2">No feedback yet. What do you think about this project?</p>
                    ) : (
                      projectComments.map(c => (
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
                    <input type="text" required placeholder="Share your feedback..." value={commentForm.message} onChange={e => setCommentForm({...commentForm, message: e.target.value})} className={`w-full flex-1 px-3 py-2 text-sm bg-transparent border border-current border-opacity-20 focus:border-opacity-100 focus:outline-none ${themeConfig.styles.radius}`} />
                    <button type="submit" disabled={isSubmitting} className={`px-4 py-2 font-bold flex items-center justify-center gap-2 ${themeConfig.styles.radius} border border-current border-opacity-20 hover:bg-current hover:text-black dark:hover:text-white transition-colors shrink-0`}>
                      {isSubmitting ? '...' : <><Send size={14}/> Send</>}
                    </button>
                  </form>
                  {submitMessage && <p className={`text-xs mt-2 text-center font-bold ${submitMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{submitMessage}</p>}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

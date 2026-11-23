import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  ArrowUpDown,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Github } from '@/components/ui/Icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { slugify, cn } from '@/lib/utils';
import type { Project } from '@/types';

// ============================================================
// INITIAL HARDCODED PROJECTS
// ============================================================
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'DavaCheck',
    slug: 'davacheck',
    short_description: 'A medicine-awareness project focused on information about potentially fake medicines.',
    full_description:
      'DavaCheck is a medicine-awareness project designed to help users identify and access information about potentially counterfeit or fake medicines. The application provides a platform where users can search for medicines and get verified information about their authenticity, helping protect consumers from harmful counterfeit pharmaceutical products.',
    technologies: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    thumbnail_url: null,
    gallery_urls: [],
    live_url: 'https://davacheck.example.com',
    github_url: 'https://github.com/Subha8436/davacheck',
    featured: true,
    display_order: 1,
    status: 'published',
    created_at: '2025-01-15T10:00:00.000Z',
    updated_at: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'proj-2',
    title: 'MealMind AI',
    slug: 'mealmind-ai',
    short_description: 'An AI-powered meal-planning and grocery-budgeting project.',
    full_description:
      'MealMind AI leverages artificial intelligence to help users plan their meals and manage grocery budgets effectively. Using the Google Gemini API, the application generates personalized meal plans based on dietary preferences, budget constraints, and available ingredients, making healthy eating more accessible and affordable.',
    technologies: ['Python', 'Flask', 'Google Gemini API', 'JavaScript'],
    thumbnail_url: null,
    gallery_urls: [],
    live_url: 'https://mealmind.example.com',
    github_url: 'https://github.com/Subha8436/mealmind-ai',
    featured: true,
    display_order: 2,
    status: 'published',
    created_at: '2025-02-01T12:00:00.000Z',
    updated_at: '2025-02-01T12:00:00.000Z',
  },
  {
    id: 'proj-3',
    title: 'WeatherGod',
    slug: 'weathergod',
    short_description: 'A weather application providing real-time weather information.',
    full_description:
      'WeatherGod is a weather application that provides users with real-time weather data and forecasts. The application features an intuitive interface that displays current conditions, temperature, humidity, and weather forecasts, helping users plan their activities around weather conditions.',
    technologies: ['JavaScript', 'HTML', 'CSS', 'Weather API'],
    thumbnail_url: null,
    gallery_urls: [],
    live_url: 'https://weathergod.example.com',
    github_url: 'https://github.com/Subha8436/weathergod',
    featured: false,
    display_order: 3,
    status: 'published',
    created_at: '2024-11-10T08:00:00.000Z',
    updated_at: '2024-11-10T08:00:00.000Z',
  },
  {
    id: 'proj-4',
    title: 'DotKart',
    slug: 'dotkart',
    short_description: 'An e-commerce and affiliate-shopping project.',
    full_description:
      'DotKart is an e-commerce and affiliate-shopping platform that provides users with a curated shopping experience. The application features product listings, search functionality, and an organized shopping interface designed to help users find and purchase products efficiently.',
    technologies: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    thumbnail_url: null,
    gallery_urls: [],
    live_url: null,
    github_url: 'https://github.com/Subha8436/dotkart',
    featured: false,
    display_order: 4,
    status: 'published',
    created_at: '2024-09-20T14:30:00.000Z',
    updated_at: '2024-09-20T14:30:00.000Z',
  },
];

const LOCAL_STORAGE_KEY = 'subhasish_admin_projects';

// ============================================================
// TYPES
// ============================================================
interface FormData {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  technologies: string;
  thumbnail_url: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  display_order: number;
  status: 'published' | 'draft' | 'archived';
}

interface FormErrors {
  title?: string;
  slug?: string;
  short_description?: string;
  technologies?: string;
  live_url?: string;
  github_url?: string;
  display_order?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export const AdminProjects: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Route auth protection check: redirect if supabase is live and user is logged out
  useEffect(() => {
    if (!loading && isSupabaseConfigured() && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  // Projects state initialized from localStorage or initial seed
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached projects from localStorage:', e);
    }
    return INITIAL_PROJECTS;
  });

  // Filters & display state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'newest'>('order');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Slug auto-generation tracking
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    technologies: '',
    thumbnail_url: '',
    live_url: '',
    github_url: '',
    featured: false,
    display_order: 1,
    status: 'published',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Sync with Supabase on mount if configured
  useEffect(() => {
    const fetchFromSupabase = async () => {
      if (!isSupabaseConfigured() || !user) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(data as Project[]);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Could not sync with Supabase (fallback to local data):', err);
      }
    };

    fetchFromSupabase();
  }, [user]);

  // Persist projects to localStorage whenever modified
  const updateProjectsState = (newProjects: Project[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProjects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  };

  // Toast helper
  const addToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    const nextOrder = projects.length > 0
      ? Math.max(...projects.map((p) => p.display_order || 0)) + 1
      : 1;

    setEditingProject(null);
    setIsSlugManuallyEdited(false);
    setFormData({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      technologies: '',
      thumbnail_url: '',
      live_url: '',
      github_url: '',
      featured: false,
      display_order: nextOrder,
      status: 'published',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsSlugManuallyEdited(true);
    setFormData({
      id: project.id,
      title: project.title,
      slug: project.slug,
      short_description: project.short_description || '',
      full_description: project.full_description || '',
      technologies: (project.technologies || []).join(', '),
      thumbnail_url: project.thumbnail_url || '',
      live_url: project.live_url || '',
      github_url: project.github_url || '',
      featured: project.featured ?? false,
      display_order: project.display_order ?? 1,
      status: project.status || 'published',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteDialog = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteDialogOpen(true);
  };

  // Form input change handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: isSlugManuallyEdited ? prev.slug : slugify(newTitle),
    }));

    if (formErrors.title) {
      setFormErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: undefined }));
    }
  };

  const handleRegenerateSlug = () => {
    setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    setIsSlugManuallyEdited(false);
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: undefined }));
    }
  };

  // Remove single tech tag from comma-separated list
  const handleRemoveTechTag = (tagToRemove: string) => {
    const currentTags = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const updated = currentTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()).join(', ');
    setFormData((prev) => ({ ...prev, technologies: updated }));
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Project title is required';
    } else if (formData.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim())) {
      errors.slug = 'Slug must only contain lowercase alphanumeric characters and hyphens';
    } else {
      // Check for slug uniqueness
      const duplicate = projects.find(
        (p) => p.slug === formData.slug.trim() && p.id !== formData.id
      );
      if (duplicate) {
        errors.slug = 'This slug is already in use by another project';
      }
    }

    if (!formData.short_description.trim()) {
      errors.short_description = 'Short description is required';
    } else if (formData.short_description.trim().length < 10) {
      errors.short_description = 'Short description must be at least 10 characters';
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (techArray.length === 0) {
      errors.technologies = 'Please provide at least one technology (comma separated)';
    }

    if (formData.live_url.trim()) {
      try {
        new URL(formData.live_url.trim());
      } catch {
        errors.live_url = 'Please enter a valid URL (including https://)';
      }
    }

    if (formData.github_url.trim()) {
      try {
        new URL(formData.github_url.trim());
      } catch {
        errors.github_url = 'Please enter a valid URL (including https://)';
      }
    }

    if (formData.display_order < 0) {
      errors.display_order = 'Display order must be 0 or higher';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Project Handler
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('error', 'Validation Error', 'Please check the form for errors before saving.');
      return;
    }

    setIsSaving(true);

    try {
      // Parse technologies into string array
      const techList = formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const timestamp = new Date().toISOString();

      if (editingProject) {
        // UPDATE PROJECT
        const updatedProject: Project = {
          ...editingProject,
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          short_description: formData.short_description.trim(),
          full_description: formData.full_description.trim(),
          technologies: techList,
          thumbnail_url: formData.thumbnail_url.trim() || null,
          live_url: formData.live_url.trim() || null,
          github_url: formData.github_url.trim() || null,
          featured: formData.featured,
          display_order: Number(formData.display_order) || 1,
          status: formData.status,
          updated_at: timestamp,
        };

        // Try Supabase if available
        if (isSupabaseConfigured() && user) {
          const { error } = await supabase
            .from('projects')
            .update(updatedProject)
            .eq('id', updatedProject.id);

          if (error) {
            console.error('Supabase update failed:', error);
            // Non-fatal: still update local state
          }
        }

        const newProjects = projects.map((p) =>
          p.id === editingProject.id ? updatedProject : p
        );
        updateProjectsState(newProjects);
        addToast('success', 'Project Updated', `"${updatedProject.title}" has been updated successfully.`);
      } else {
        // CREATE NEW PROJECT
        const newProject: Project = {
          id: 'proj-' + Date.now().toString(36),
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          short_description: formData.short_description.trim(),
          full_description: formData.full_description.trim(),
          technologies: techList,
          thumbnail_url: formData.thumbnail_url.trim() || null,
          gallery_urls: [],
          live_url: formData.live_url.trim() || null,
          github_url: formData.github_url.trim() || null,
          featured: formData.featured,
          display_order: Number(formData.display_order) || 1,
          status: formData.status,
          created_at: timestamp,
          updated_at: timestamp,
        };

        // Try Supabase if available
        if (isSupabaseConfigured() && user) {
          const { error } = await supabase.from('projects').insert([newProject]);
          if (error) {
            console.error('Supabase insert failed:', error);
          }
        }

        const newProjects = [...projects, newProject];
        updateProjectsState(newProjects);
        addToast('success', 'Project Created', `"${newProject.title}" has been added to your projects.`);
      }

      // Close modal
      setIsFormModalOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      console.error('Error saving project:', err);
      addToast('error', 'Error Saving Project', err?.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Project Handler
  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      if (isSupabaseConfigured() && user) {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', deletingProject.id);

        if (error) {
          console.error('Supabase delete error:', error);
        }
      }

      const newProjects = projects.filter((p) => p.id !== deletingProject.id);
      updateProjectsState(newProjects);
      addToast('success', 'Project Deleted', `"${deletingProject.title}" was removed.`);
      setIsDeleteDialogOpen(false);
      setDeletingProject(null);
    } catch (err: any) {
      console.error('Error deleting project:', err);
      addToast('error', 'Delete Failed', err?.message || 'Failed to delete the project.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Featured Toggle
  const handleToggleFeatured = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...project, featured: !project.featured, updated_at: new Date().toISOString() };
    const newProjects = projects.map((p) => (p.id === project.id ? updated : p));
    updateProjectsState(newProjects);

    if (isSupabaseConfigured() && user) {
      await supabase.from('projects').update({ featured: updated.featured }).eq('id', project.id);
    }

    addToast(
      'info',
      updated.featured ? 'Marked as Featured' : 'Unmarked as Featured',
      `"${project.title}" featured status updated.`
    );
  };

  // Quick Status Toggle
  const handleQuickStatusChange = async (project: Project, newStatus: 'published' | 'draft' | 'archived') => {
    const updated = { ...project, status: newStatus, updated_at: new Date().toISOString() };
    const newProjects = projects.map((p) => (p.id === project.id ? updated : p));
    updateProjectsState(newProjects);

    if (isSupabaseConfigured() && user) {
      await supabase.from('projects').update({ status: newStatus }).eq('id', project.id);
    }

    addToast('info', 'Status Updated', `"${project.title}" is now ${newStatus}.`);
  };

  // Reset to initial 4 projects
  const handleResetToSeedData = () => {
    updateProjectsState(INITIAL_PROJECTS);
    addToast('info', 'Reset Complete', 'Projects reset to initial 4 showcase projects.');
  };

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = project.title.toLowerCase().includes(q);
          const matchesSlug = project.slug.toLowerCase().includes(q);
          const matchesDesc = (project.short_description || '').toLowerCase().includes(q);
          const matchesTech = (project.technologies || []).some((tech) =>
            tech.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesSlug && !matchesDesc && !matchesTech) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && project.status !== statusFilter) {
          return false;
        }

        // Featured filter
        if (featuredFilter === 'featured' && !project.featured) return false;
        if (featuredFilter === 'regular' && project.featured) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'order') {
          return (a.display_order ?? 999) - (b.display_order ?? 999);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        return 0;
      });
  }, [projects, searchQuery, statusFilter, featuredFilter, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: projects.length,
      published: projects.filter((p) => p.status === 'published').length,
      drafts: projects.filter((p) => p.status === 'draft').length,
      featured: projects.filter((p) => p.featured).length,
    };
  }, [projects]);

  // Current tags for the form input preview
  const currentFormTags = useMemo(() => {
    return formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [formData.technologies]);

  return (
    <AdminLayout
      title="Manage Projects"
      subtitle="Create, edit, organize, and showcase your portfolio projects"
    >
      {/* ================= TOAST CONTAINER ================= */}
      <div className="fixed top-6 right-6 z-[100] space-y-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-xl flex items-start gap-3',
                toast.type === 'success' && 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10',
                toast.type === 'error' && 'bg-red-950/90 border-red-500/40 text-red-100 shadow-red-500/10',
                toast.type === 'info' && 'bg-primary-950/90 border-primary-500/40 text-primary-100 shadow-primary-500/10'
              )}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message && <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        {/* ================= SUPABASE NOTICE CALLOUT BANNER ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-900/90 via-surface-900/60 to-primary-950/30 border border-primary-500/30 p-4 sm:p-5 shadow-lg shadow-black/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Database className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Connect Supabase to enable full CRUD operations
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Demo Mode Active
                  </span>
                </div>
                <p className="text-xs text-surface-400 mt-1 max-w-2xl">
                  Currently running with {projects.length} showcase projects. Any projects added, edited, or deleted are saved in your browser's local state. Connect your live Supabase credentials in <code className="text-primary-300 bg-surface-950 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> to synchronize with PostgreSQL in production.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleResetToSeedData}
                title="Reset projects to initial 4 seed projects"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors border border-surface-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Seed (4)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= PAGE HEADER & METRICS ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white">
                {t('admin.projects', 'Manage Projects')}
              </h2>
            </div>
            <p className="text-sm text-surface-400 mt-1">
              Curate, highlight, and manage all showcase applications on your portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-medium text-sm shadow-lg shadow-primary-600/25 hover:shadow-primary-600/35 active:scale-95 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>{t('admin.add', 'Add New Project')}</span>
            </button>
          </div>
        </div>

        {/* ================= STATS SUMMARY CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <p className="text-xs font-medium text-surface-400">Total Projects</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <p className="text-xs font-medium text-emerald-400">Published</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.published}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <p className="text-xs font-medium text-amber-400">Drafts</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.drafts}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <p className="text-xs font-medium text-primary-400">Featured</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.featured}</p>
          </div>
        </div>

        {/* ================= SEARCH & FILTER CONTROLS ================= */}
        <div className="p-4 rounded-2xl bg-surface-900/70 border border-surface-800/80 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, technology, slug..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-950 border border-surface-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-surface-100 placeholder-surface-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Status Select */}
              <div className="flex items-center gap-1.5 text-xs text-surface-400">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-2 rounded-lg bg-surface-950 border border-surface-800 text-xs font-medium text-surface-200 focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Featured Filter */}
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                className="px-2.5 py-2 rounded-lg bg-surface-950 border border-surface-800 text-xs font-medium text-surface-200 focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Highlights</option>
                <option value="featured">Featured Only</option>
                <option value="regular">Standard Only</option>
              </select>

              {/* Sort By */}
              <div className="flex items-center gap-1 text-xs text-surface-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-2 rounded-lg bg-surface-950 border border-surface-800 text-xs font-medium text-surface-200 focus:outline-none focus:border-primary-500"
                >
                  <option value="order">Order (Ascending)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Layout Toggle for desktop */}
              <div className="hidden md:flex items-center border border-surface-800 rounded-lg p-0.5 bg-surface-950">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Table view"
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'table' ? 'bg-primary-600/30 text-primary-300' : 'text-surface-400 hover:text-white'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="Cards view"
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'cards' ? 'bg-primary-600/30 text-primary-300' : 'text-surface-400 hover:text-white'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters indicators */}
          {(searchQuery || statusFilter !== 'all' || featuredFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-800 text-xs text-surface-400">
              <span>Filtering by:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 text-surface-200">
                  query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 text-surface-200">
                  status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {featuredFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 text-surface-200">
                  featured: {featuredFilter}
                  <button onClick={() => setFeaturedFilter('all')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setFeaturedFilter('all');
                }}
                className="text-primary-400 hover:underline ml-1"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ================= PROJECTS LIST: RESPONSIVE CARDS (MOBILE) & TABLE (DESKTOP) ================= */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-surface-800 bg-surface-900/30">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-800/80 flex items-center justify-center text-surface-400 mb-3">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No projects found</h3>
            <p className="text-xs text-surface-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || featuredFilter !== 'all'
                ? 'No projects match your current filters. Try resetting the search or filter settings.'
                : 'Get started by creating your very first showcase project.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {(searchQuery || statusFilter !== 'all' || featuredFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setFeaturedFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors"
              >
                Add New Project
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ====== DESKTOP TABLE VIEW ====== */}
            <div className={cn(
              'rounded-2xl border border-surface-800/80 bg-surface-900/40 backdrop-blur-md overflow-hidden shadow-xl shadow-black/20',
              viewMode === 'cards' ? 'hidden' : 'hidden md:block'
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-950/80 border-b border-surface-800/80 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="py-3.5 px-4 w-12 text-center">#</th>
                      <th scope="col" className="py-3.5 px-4 min-w-[240px]">Project</th>
                      <th scope="col" className="py-3.5 px-4 min-w-[220px]">Technologies</th>
                      <th scope="col" className="py-3.5 px-4 w-28 text-center">Featured</th>
                      <th scope="col" className="py-3.5 px-4 w-32 text-center">Status</th>
                      <th scope="col" className="py-3.5 px-4 w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/60 font-normal">
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="hover:bg-surface-800/30 transition-colors group"
                      >
                        {/* Order Column */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-surface-800 text-[11px] font-mono font-medium text-surface-400">
                            {project.display_order ?? '-'}
                          </span>
                        </td>

                        {/* Project Info Column */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700/60 flex items-center justify-center">
                              {project.thumbnail_url ? (
                                <img
                                  src={project.thumbnail_url}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-display font-bold text-sm text-primary-400">
                                  {project.title.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white group-hover:text-primary-300 transition-colors truncate">
                                  {project.title}
                                </p>
                              </div>
                              <p className="text-xs font-mono text-surface-400 truncate mt-0.5">
                                /{project.slug}
                              </p>
                              <p className="text-xs text-surface-400 line-clamp-1 mt-1 max-w-md">
                                {project.short_description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Technologies Tags */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {(project.technologies || []).slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-800/90 text-surface-300 border border-surface-700/50"
                              >
                                {tech}
                              </span>
                            ))}
                            {(project.technologies || []).length > 4 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-surface-400 bg-surface-800/40">
                                +{(project.technologies || []).length - 4}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Featured Toggle Column */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFeatured(project, e)}
                            title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95',
                              project.featured
                                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                : 'bg-surface-800/40 text-surface-500 hover:text-surface-300 border border-transparent'
                            )}
                          >
                            <Star
                              className={cn(
                                'w-3.5 h-3.5',
                                project.featured ? 'fill-primary-400 text-primary-400' : 'text-surface-500'
                              )}
                            />
                            <span>{project.featured ? 'Featured' : 'Standard'}</span>
                          </button>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-block relative">
                            <select
                              value={project.status}
                              onChange={(e) => handleQuickStatusChange(project, e.target.value as any)}
                              className={cn(
                                'appearance-none pl-6 pr-4 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500',
                                project.status === 'published' && 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                                project.status === 'draft' && 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                                project.status === 'archived' && 'bg-surface-800 text-surface-400 border-surface-700'
                              )}
                            >
                              <option value="published" className="bg-surface-950 text-white">Published</option>
                              <option value="draft" className="bg-surface-950 text-white">Draft</option>
                              <option value="archived" className="bg-surface-950 text-white">Archived</option>
                            </select>
                            <span
                              className={cn(
                                'w-2 h-2 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none',
                                project.status === 'published' && 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
                                project.status === 'draft' && 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]',
                                project.status === 'archived' && 'bg-surface-500'
                              )}
                            />
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Live Demo Link */}
                            {project.live_url && (
                              <a
                                href={project.live_url}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Live Demo"
                                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}

                            {/* GitHub Link */}
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noreferrer"
                                title="Open GitHub Repository"
                                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(project)}
                              title={t('admin.edit', 'Edit Project')}
                              className="p-1.5 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteDialog(project)}
                              title={t('admin.delete', 'Delete Project')}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ====== MOBILE RESPONSIVE CARDS VIEW (AND DESKTOP CARDS TOGGLE) ====== */}
            <div className={cn(
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
              viewMode === 'table' ? 'block md:hidden' : 'grid'
            )}>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-surface-800/80 bg-surface-900/60 backdrop-blur-md p-5 flex flex-col justify-between hover:border-surface-700 transition-all duration-200 shadow-lg shadow-black/10 group"
                >
                  <div>
                    {/* Top row: Order, Star, Status badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-surface-800/70">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-surface-800 text-[11px] font-mono font-semibold text-surface-300">
                          #{project.display_order}
                        </span>
                        {project.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                            <Star className="w-3 h-3 fill-primary-400 text-primary-400" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Status Pill */}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                          project.status === 'published' && 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                          project.status === 'draft' && 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                          project.status === 'archived' && 'bg-surface-800 text-surface-400 border-surface-700'
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            project.status === 'published' && 'bg-emerald-400',
                            project.status === 'draft' && 'bg-amber-400',
                            project.status === 'archived' && 'bg-surface-500'
                          )}
                        />
                        <span className="capitalize">{project.status}</span>
                      </span>
                    </div>

                    {/* Card Title & Meta */}
                    <div className="mt-3.5 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-display font-bold text-sm text-primary-400">
                            {project.title.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-xs font-mono text-primary-400/80">
                          /{project.slug}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-surface-400 mt-2.5 line-clamp-2">
                      {project.short_description}
                    </p>

                    {/* Tech stack */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {(project.technologies || []).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-800 text-surface-300 border border-surface-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Links & Actions */}
                  <div className="mt-5 pt-3.5 border-t border-surface-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Live Demo"
                          className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Source Code"
                          className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-white"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(project)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600/20 text-primary-300 hover:bg-primary-600/30 border border-primary-500/30 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{t('admin.edit', 'Edit')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteDialog(project)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title={t('admin.delete', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ================= ADD / EDIT PROJECT MODAL ================= */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsFormModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="inline-block w-full max-w-2xl text-left bg-surface-950 border border-surface-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-5 border-b border-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Project'}
                      </h3>
                      <p className="text-xs text-surface-400">
                        {editingProject
                          ? 'Update the project details, links, or showcase status'
                          : 'Fill in the information below to add a new project to your showcase'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsFormModalOpen(false)}
                    className="p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-900 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProject} className="mt-6 space-y-5">
                  {/* Title & Slug Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                        Project Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. DavaCheck or MealMind AI"
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border text-sm text-white placeholder-surface-500 transition-colors focus:outline-none focus:ring-1',
                          formErrors.title
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
                            : 'border-surface-800 focus:border-primary-500 focus:ring-primary-500'
                        )}
                      />
                      {formErrors.title && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.title}
                        </p>
                      )}
                    </div>

                    {/* Slug */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-surface-300">
                          URL Slug <span className="text-red-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleRegenerateSlug}
                          className="text-[11px] text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="e.g. mealmind-ai"
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border font-mono text-sm text-primary-300 placeholder-surface-500 transition-colors focus:outline-none focus:ring-1',
                          formErrors.slug
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
                            : 'border-surface-800 focus:border-primary-500 focus:ring-primary-500'
                        )}
                      />
                      {formErrors.slug ? (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.slug}
                        </p>
                      ) : (
                        <p className="text-[11px] text-surface-500 mt-1">
                          Direct path: /projects/{formData.slug || 'your-slug'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-surface-300">
                        Short Description <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[11px] text-surface-500">
                        {formData.short_description.length}/150
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, short_description: e.target.value }));
                        if (formErrors.short_description) {
                          setFormErrors((prev) => ({ ...prev, short_description: undefined }));
                        }
                      }}
                      placeholder="Concise 1-2 sentence overview shown on project cards"
                      maxLength={180}
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border text-sm text-white placeholder-surface-500 transition-colors focus:outline-none focus:ring-1',
                        formErrors.short_description
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
                          : 'border-surface-800 focus:border-primary-500 focus:ring-primary-500'
                      )}
                    />
                    {formErrors.short_description && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.short_description}
                      </p>
                    )}
                  </div>

                  {/* Full Description (Textarea) */}
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                      Full Description (Detailed Narrative / Case Study)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.full_description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, full_description: e.target.value }))}
                      placeholder="Detailed breakdown of features, architecture, problems solved, and learnings..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border border-surface-800 text-sm text-white placeholder-surface-500 transition-colors focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Technologies (Comma-separated with interactive preview badges) */}
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                      Technologies <span className="text-red-400">*</span>
                      <span className="text-surface-500 font-normal ml-1">
                        (comma-separated, e.g. React, TypeScript, Python, Flask)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.technologies}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, technologies: e.target.value }));
                        if (formErrors.technologies) {
                          setFormErrors((prev) => ({ ...prev, technologies: undefined }));
                        }
                      }}
                      placeholder="e.g. React, TypeScript, Tailwind CSS, Supabase"
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border text-sm text-white placeholder-surface-500 transition-colors focus:outline-none focus:ring-1',
                        formErrors.technologies
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
                          : 'border-surface-800 focus:border-primary-500 focus:ring-primary-500'
                      )}
                    />
                    {formErrors.technologies && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.technologies}
                      </p>
                    )}

                    {/* Tag Previews */}
                    {currentFormTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-surface-500">Preview tags:</span>
                        {currentFormTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary-500/15 text-primary-300 border border-primary-500/30"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTechTag(tag)}
                              className="text-primary-400 hover:text-white"
                              title={`Remove ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload Placeholder */}
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                      Thumbnail Image
                    </label>
                    <div className="border border-dashed border-surface-800 hover:border-surface-700 rounded-2xl p-4 bg-surface-900/40 text-center transition-colors">
                      {formData.thumbnail_url ? (
                        <div className="relative inline-block rounded-xl overflow-hidden border border-surface-700 max-w-xs mx-auto">
                          <img
                            src={formData.thumbnail_url}
                            alt="Thumbnail preview"
                            className="h-32 w-auto object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: '' }))}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center mx-auto text-surface-400">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-surface-200">
                              Thumbnail Upload Placeholder
                            </p>
                            <p className="text-[11px] text-surface-500 mt-0.5">
                              Supports PNG, JPG, WebP up to 5MB. In production, files upload to Supabase Storage.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Direct URL input fallback */}
                      <div className="mt-3 pt-3 border-t border-surface-800/80 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-surface-500 shrink-0" />
                        <input
                          type="text"
                          value={formData.thumbnail_url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                          placeholder="Or paste external image URL (https://...)"
                          className="flex-1 bg-surface-950 px-3 py-1.5 rounded-lg border border-surface-800 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live URL & GitHub URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        value={formData.live_url}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, live_url: e.target.value }));
                          if (formErrors.live_url) setFormErrors((prev) => ({ ...prev, live_url: undefined }));
                        }}
                        placeholder="https://example.com"
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border text-sm text-white placeholder-surface-500 transition-colors focus:outline-none focus:ring-1',
                          formErrors.live_url
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
                            : 'border-surface-800 focus:border-primary-500 focus:ring-primary-500'
                        )}
                      />
                      {formErrors.live_url && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.live_url}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                        GitHub Repository URL
                      </label>
                      <input
                        type="url"
                        value={formData.github_url}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, github_url: e.target.value }));
                          if (formErrors.github_url) setFormErrors((prev) => ({ ...prev, github_url: undefined }));
                        }}
                        placeholder="https://github.com/Subha8436/..."
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border text-sm text-white placeholder-surface-500 transition-colors focus:outline-none focus:ring-1',
                          formErrors.github_url
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
                            : 'border-surface-800 focus:border-primary-500 focus:ring-primary-500'
                        )}
                      />
                      {formErrors.github_url && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.github_url}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Display Order & Status & Featured Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-900/60 border border-surface-800">
                    {/* Display Order */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.display_order}
                        onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-800 text-sm text-white focus:outline-none focus:border-primary-500"
                      />
                      <p className="text-[10px] text-surface-500 mt-1">Lower numbers appear first</p>
                    </div>

                    {/* Status Select */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-800 text-sm text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      <p className="text-[10px] text-surface-500 mt-1">Controls portfolio visibility</p>
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex flex-col justify-center">
                      <label className="text-xs font-semibold text-surface-300 mb-2">
                        Featured Highlight
                      </label>
                      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 relative" />
                        <span className="text-xs font-medium text-surface-300">
                          {formData.featured ? 'Featured Project' : 'Standard'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-4 border-t border-surface-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsFormModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-surface-700 hover:bg-surface-900 text-sm font-medium text-surface-300 transition-colors disabled:opacity-50"
                    >
                      {t('admin.cancel', 'Cancel')}
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-medium shadow-lg shadow-primary-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t('admin.saving', 'Saving...')}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('admin.save', 'Save Changes')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      <AnimatePresence>
        {isDeleteDialogOpen && deletingProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsDeleteDialogOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="inline-block w-full max-w-md text-left bg-surface-950 border border-surface-800 rounded-3xl shadow-2xl p-6 relative z-10 overflow-hidden"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-surface-800">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t('admin.delete', 'Delete Project')}
                    </h3>
                    <p className="text-xs text-surface-400">
                      {t('admin.confirm', 'Are you sure?')}
                    </p>
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <p className="text-xs text-surface-300">
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-white">"{deletingProject.title}"</strong>?
                    This action will remove the project from your showcase list.
                  </p>

                  <div className="p-3 rounded-xl bg-surface-900 border border-surface-800 text-xs">
                    <p className="text-surface-400 font-mono">Slug: /{deletingProject.slug}</p>
                    <p className="text-surface-400 capitalize mt-0.5">Status: {deletingProject.status}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="px-4 py-2 rounded-xl border border-surface-700 hover:bg-surface-900 text-xs font-semibold text-surface-300 transition-colors disabled:opacity-50"
                  >
                    {t('admin.cancel', 'Cancel')}
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDeleteConfirm}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProjects;

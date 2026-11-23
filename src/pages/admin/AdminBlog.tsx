import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Archive,
  CheckCircle2,
  Clock,
  Tag,
  Folder,
  Calendar,
  AlertCircle,
  X,
  Save,
  ArrowLeft,
  ExternalLink,
  FileText,
  Sparkles,
  Database,
  RefreshCw,
  Check,
  AlertTriangle,
  Layers,
  Globe,
  LogOut,
  Image,
  Upload,
  BookOpen,
  Bold,
  Italic,
  Code,
  List,
  Quote,
  Heading2,
  ChevronRight,
  Send,
  Star
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateReadingTime, formatDate, slugify, truncate } from '@/lib/utils';
import type { BlogPost } from '@/types';

// Category options as specified in requirements
const CATEGORIES = [
  'AI',
  'Web Development',
  'Python',
  'JavaScript',
  'Automation',
  'Project Case Studies',
  'Technology Discoveries',
  'Development Tutorials',
] as const;

type CategoryType = (typeof CATEGORIES)[number];
type TabType = 'all' | 'draft' | 'published' | 'archived';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ArticleFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: CategoryType;
  tagsString: string;
  cover_image_url: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

const INITIAL_FORM_DATA: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Web Development',
  tagsString: '',
  cover_image_url: '',
  featured: false,
  status: 'draft',
};

const LOCAL_STORAGE_KEY = 'subhasish_admin_blog_posts';

export default function AdminBlog() {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Blog Posts state - initially empty to showcase friendly empty state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<ArticleFormData>(INITIAL_FORM_DATA);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [formActiveTab, setFormActiveTab] = useState<'write' | 'preview'>('write');

  // Delete confirmation modal state
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Quick single-post preview modal
  const [previewingPost, setPreviewingPost] = useState<BlogPost | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Textarea ref for inserting markdown formatting
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Auth check: redirect to /admin/login if not logged in
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login', { replace: true, state: { from: '/admin/blog' } });
    }
  }, [authLoading, isAdmin, navigate]);

  // Toast helper function
  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load posts from Supabase or localStorage fallback
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error, checking localStorage:', error.message);
          loadFromLocalStorage();
        } else if (data) {
          setPosts(data as BlogPost[]);
          // Keep localStorage in sync
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }
      } else {
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      loadFromLocalStorage();
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPosts(parsed);
          return;
        }
      }
      // Initially empty if nothing stored
      setPosts([]);
    } catch (e) {
      console.error('Failed to parse posts from localStorage:', e);
      setPosts([]);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin]);

  // Sync state changes to localStorage
  const persistPosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Handle title change with auto slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isSlugManuallyEdited ? prev.slug : slugify(title),
    }));
  };

  // Handle manual slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: slugify(e.target.value),
    }));
  };

  // Open modal for creating a new article
  const handleOpenCreateModal = () => {
    setEditingPostId(null);
    setFormData(INITIAL_FORM_DATA);
    setIsSlugManuallyEdited(false);
    setFormActiveTab('write');
    setIsFormOpen(true);
  };

  // Open modal for editing an existing article
  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPostId(post.id);
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: (CATEGORIES.includes(post.category as CategoryType)
        ? post.category
        : 'Web Development') as CategoryType,
      tagsString: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      cover_image_url: post.cover_image_url || '',
      featured: post.featured || false,
      status: post.status,
    });
    setIsSlugManuallyEdited(true);
    setFormActiveTab('write');
    setIsFormOpen(true);
  };

  // Save article (Create or Update)
  const handleSaveArticle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      addToast('error', 'Validation Error', 'Article title is required.');
      return;
    }

    if (!formData.content.trim()) {
      addToast('error', 'Validation Error', 'Article content cannot be empty.');
      return;
    }

    const calculatedSlug = formData.slug.trim() || slugify(formData.title);
    if (!calculatedSlug) {
      addToast('error', 'Validation Error', 'Valid URL slug is required.');
      return;
    }

    // Check slug uniqueness amongst other posts
    const isDuplicateSlug = posts.some(
      (p) => p.slug === calculatedSlug && p.id !== editingPostId
    );
    if (isDuplicateSlug) {
      addToast('error', 'Duplicate Slug', `The slug "${calculatedSlug}" is already in use.`);
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();
    const tagsArray = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const readingTime = calculateReadingTime(formData.content);

    try {
      if (editingPostId) {
        // Updating existing post
        const existing = posts.find((p) => p.id === editingPostId);
        const updatedPost: BlogPost = {
          id: editingPostId,
          title: formData.title.trim(),
          slug: calculatedSlug,
          excerpt: formData.excerpt.trim() || truncate(formData.content, 160),
          content: formData.content,
          cover_image_url: formData.cover_image_url.trim() || null,
          category: formData.category,
          tags: tagsArray,
          status: formData.status,
          featured: formData.featured,
          reading_time: readingTime,
          published_at:
            formData.status === 'published'
              ? existing?.published_at || now
              : existing?.published_at || null,
          created_at: existing?.created_at || now,
          updated_at: now,
        };

        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('blog_posts')
            .upsert(updatedPost);

          if (error) {
            console.warn('Supabase update warning:', error.message);
            addToast('info', 'Supabase Notice', 'Changes stored locally (Supabase table pending).');
          }
        }

        const updatedList = posts.map((p) => (p.id === editingPostId ? updatedPost : p));
        persistPosts(updatedList);
        addToast('success', 'Article Updated', `"${updatedPost.title}" was saved successfully.`);
      } else {
        // Creating new post
        const newPost: BlogPost = {
          id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: formData.title.trim(),
          slug: calculatedSlug,
          excerpt: formData.excerpt.trim() || truncate(formData.content, 160),
          content: formData.content,
          cover_image_url: formData.cover_image_url.trim() || null,
          category: formData.category,
          tags: tagsArray,
          status: formData.status,
          featured: formData.featured,
          reading_time: readingTime,
          published_at: formData.status === 'published' ? now : null,
          created_at: now,
          updated_at: now,
        };

        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('blog_posts')
            .insert(newPost);

          if (error) {
            console.warn('Supabase insert warning:', error.message);
            addToast('info', 'Supabase Notice', 'Article saved locally (Connect Supabase table to persist to cloud).');
          }
        }

        const updatedList = [newPost, ...posts];
        persistPosts(updatedList);
        addToast('success', 'Article Created', `"${newPost.title}" has been created.`);
      }

      setIsFormOpen(false);
      setEditingPostId(null);
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      console.error('Save failed:', err);
      addToast('error', 'Save Failed', 'An error occurred while saving the article.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick status transitions
  const handleQuickStatusChange = async (post: BlogPost, newStatus: 'published' | 'archived' | 'draft') => {
    const now = new Date().toISOString();
    const updatedPost: BlogPost = {
      ...post,
      status: newStatus,
      published_at: newStatus === 'published' ? (post.published_at || now) : post.published_at,
      updated_at: now,
    };

    try {
      if (isSupabaseConfigured()) {
        await supabase
          .from('blog_posts')
          .update({
            status: newStatus,
            published_at: updatedPost.published_at,
            updated_at: now,
          })
          .eq('id', post.id);
      }

      const updatedList = posts.map((p) => (p.id === post.id ? updatedPost : p));
      persistPosts(updatedList);

      const statusLabels = {
        published: 'published',
        archived: 'archived',
        draft: 'reverted to draft',
      };
      addToast('success', 'Status Updated', `"${post.title}" is now ${statusLabels[newStatus]}.`);
    } catch (err) {
      console.error('Status update failed:', err);
      addToast('error', 'Update Failed', 'Could not update post status.');
    }
  };

  // Delete article confirmation handler
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postToDelete.id);

        if (error) {
          console.warn('Supabase delete error:', error.message);
        }
      }

      const updatedList = posts.filter((p) => p.id !== postToDelete.id);
      persistPosts(updatedList);
      addToast('success', 'Article Deleted', `"${postToDelete.title}" has been deleted.`);
      setPostToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      addToast('error', 'Delete Failed', 'Failed to delete the article.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Markdown helper buttons
  const insertMarkdownSyntax = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const selectedText = currentVal.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setFormData((prev) => ({ ...prev, content: newVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  // Seed sample post if user wants quick mock data for demonstration
  const handleSeedSampleArticles = () => {
    const samplePost: BlogPost = {
      id: `sample_${Date.now()}`,
      title: 'Architecting High-Performance Full-Stack Applications with React and Node',
      slug: 'architecting-high-performance-full-stack-apps',
      excerpt: 'A comprehensive architectural guide exploring modern frontend caching, reactive state management, asynchronous background jobs, and edge database delivery.',
      content: `# Building Scalable Web Systems

Modern web applications require careful consideration of both client responsiveness and backend throughput. In this article, we dive deep into the real-world patterns that keep latencies under 50ms.

## Key Architectural Pillars
1. **Edge-rendered client interfaces** with optimistic mutations.
2. **PostgreSQL with connection pooling** and automated read-replicas.
3. **Decoupled message queues** for heavy background computations.

\`\`\`typescript
interface SystemConfig {
  maxConcurrency: number;
  cacheTtlSeconds: number;
  enableEdgeReplication: boolean;
}

export function initializeCluster(config: SystemConfig): void {
  console.log('Cluster initiated with concurrency:', config.maxConcurrency);
}
\`\`\`

> *"Premature optimization is the root of all evil, but thoughtful architecture from day one is the antidote to technical bankruptcy."*

### Performance Metrics Observed
- **99th Percentile TTFB**: Reduced from 380ms to 42ms.
- **Client Bundle Size**: Trimmed by 44% with code splitting.
- **Database CPU Load**: Decreased by 68% after caching layer integration.`,
      cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      category: 'Web Development',
      tags: ['React', 'Node.js', 'Architecture', 'TypeScript', 'Performance'],
      status: 'published',
      featured: true,
      reading_time: 4,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [samplePost, ...posts];
    persistPosts(updated);
    addToast('success', 'Sample Post Added', 'Created sample post to demonstrate layout.');
  };

  // Filter posts according to active tab, search query, and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (activeTab === 'draft' && post.status !== 'draft') return false;
      if (activeTab === 'published' && post.status !== 'published') return false;
      if (activeTab === 'archived' && post.status !== 'archived') return false;

      // Category filter
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesExcerpt = post.excerpt?.toLowerCase().includes(query);
        const matchesContent = post.content?.toLowerCase().includes(query);
        const matchesCategory = post.category?.toLowerCase().includes(query);
        const matchesTags = Array.isArray(post.tags) && post.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesExcerpt || matchesContent || matchesCategory || matchesTags;
      }

      return true;
    });
  }, [posts, activeTab, selectedCategory, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: posts.length,
      draft: posts.filter((p) => p.status === 'draft').length,
      published: posts.filter((p) => p.status === 'published').length,
      archived: posts.filter((p) => p.status === 'archived').length,
    };
  }, [posts]);

  // If checking authentication, render a clean spinner state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-surface-200">
        <RefreshCw className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <h2 className="text-xl font-medium">Verifying Administrator Session...</h2>
        <p className="text-surface-500 text-sm mt-1">Checking secure credentials</p>
      </div>
    );
  }

  // If not logged in, redirection will happen in useEffect
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col selection:bg-primary-500/30 selection:text-white">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface-900/90 backdrop-blur-md border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="flex items-center space-x-2 text-surface-400 hover:text-white transition-colors group"
              title="Return to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-white tracking-wide">Admin Portal</span>
            </Link>
            <span className="text-surface-700">/</span>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-surface-200">Blog Management</span>
            </div>
          </div>

          {/* Quick Admin Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/projects"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/admin/blog"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600/20 text-primary-300 border border-primary-500/30 transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/admin/messages"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              Messages
            </Link>
            <Link
              to="/admin/profile"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              Profile
            </Link>
          </nav>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-300 hover:text-white bg-surface-800/80 hover:bg-surface-800 rounded-lg border border-surface-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Public Blog</span>
              <ExternalLink className="w-3 h-3 text-surface-500" />
            </Link>

            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Persistence Status & Connection Note */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            isSupabaseConfigured()
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
              : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                isSupabaseConfigured() ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {isSupabaseConfigured() ? 'Supabase Database Connected' : 'Storage Notice'}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSupabaseConfigured()
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isSupabaseConfigured() ? 'Cloud Synced' : 'Local Storage Mode'}
                </span>
              </div>
              <p className="text-xs text-surface-400 mt-1">
                {isSupabaseConfigured()
                  ? 'All changes are automatically synced to your cloud database.'
                  : 'Connect Supabase to persist blog posts across multiple devices and production deployments.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchPosts}
              disabled={isLoadingPosts}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-300 hover:text-white bg-surface-800/80 hover:bg-surface-800 rounded-lg border border-surface-700 transition-colors w-full sm:w-auto justify-center"
              title="Refresh post list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? 'animate-spin text-primary-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Page Heading & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Manage Blog Posts</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-800 text-surface-400 border border-surface-700 font-normal">
                {posts.length} {posts.length === 1 ? 'article' : 'articles'}
              </span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">
              Publish technical writeups, tutorials, architecture reviews, and project stories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar Row */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Filter tabs: All, Drafts, Published, Archived */}
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-950 p-1.5 rounded-xl border border-surface-800/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'all' ? 'bg-primary-700 text-white' : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('draft')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'draft'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'
                }`}
              >
                <span>Drafts</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'draft' ? 'bg-amber-700 text-white' : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.draft}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('published')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'published'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'
                }`}
              >
                <span>Published</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'published' ? 'bg-emerald-700 text-white' : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.published}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('archived')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'archived'
                    ? 'bg-surface-700 text-white shadow'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'
                }`}
              >
                <span>Archived</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'archived' ? 'bg-surface-800 text-white' : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.archived}
                </span>
              </button>
            </div>

            {/* Search and Category Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Category dropdown */}
              <div className="relative w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pl-9 rounded-xl bg-surface-950 border border-surface-800 text-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Folder className="w-3.5 h-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search articles, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-9 pr-8 rounded-xl bg-surface-950 border border-surface-800 text-surface-200 placeholder-surface-500 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
                <Search className="w-3.5 h-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Post List or Empty State */}
        {isLoadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface-900 border border-surface-800/80 rounded-2xl p-5 space-y-4 animate-pulse"
              >
                <div className="w-full h-40 bg-surface-800 rounded-xl" />
                <div className="h-4 bg-surface-800 rounded w-1/3" />
                <div className="h-6 bg-surface-800 rounded w-3/4" />
                <div className="h-12 bg-surface-800/50 rounded w-full" />
                <div className="h-8 bg-surface-800 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Friendly Empty State */
          <div className="bg-surface-900/60 border border-surface-800/80 rounded-3xl p-12 text-center max-w-2xl mx-auto my-6 space-y-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 flex items-center justify-center mx-auto text-primary-400 shadow-inner">
              <FileText className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {searchQuery || selectedCategory !== 'All' || activeTab !== 'all'
                  ? 'No matching articles found'
                  : 'No blog posts yet'}
              </h3>
              <p className="text-surface-400 text-sm max-w-md mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== 'All' || activeTab !== 'all'
                  ? 'Try broadening your search query or switching filter tabs to see your other articles.'
                  : 'Get started by creating your very first blog article. Share insights, project walkthroughs, tutorials, and development stories with your readers.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {searchQuery || selectedCategory !== 'All' || activeTab !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setActiveTab('all');
                  }}
                  className="px-4 py-2 text-xs font-medium text-surface-200 bg-surface-800 hover:bg-surface-700 rounded-xl border border-surface-700 transition-colors"
                >
                  Reset all filters
                </button>
              ) : (
                <>
                  <button
                    onClick={handleOpenCreateModal}
                    className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Article</span>
                  </button>

                  <button
                    onClick={handleSeedSampleArticles}
                    className="px-4 py-2.5 text-xs font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-xl border border-surface-700 transition-colors flex items-center gap-2"
                    title="Insert a sample post to test the layout"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                    <span>Load Demo Post</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const statusStyles = {
                draft: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                archived: 'bg-surface-700/40 text-surface-400 border-surface-600/30',
              }[post.status];

              return (
                <div
                  key={post.id}
                  className="group bg-surface-900 border border-surface-800 hover:border-surface-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1"
                >
                  {/* Cover Image Thumbnail or Gradient Header */}
                  <div className="relative h-44 bg-surface-950 overflow-hidden border-b border-surface-800/80">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950/40 flex items-center justify-center text-surface-700">
                        <BookOpen className="w-12 h-12 opacity-30" />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md uppercase tracking-wider ${statusStyles}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.status === 'published'
                              ? 'bg-emerald-400 animate-pulse'
                              : post.status === 'draft'
                              ? 'bg-amber-400'
                              : 'bg-surface-400'
                          }`}
                        />
                        {post.status}
                      </span>

                      {/* Featured star badge */}
                      {post.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Category pill on image bottom */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface-950/80 text-surface-200 border border-surface-700/60 backdrop-blur-md">
                        <Folder className="w-3 h-3 text-primary-400" />
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3
                        className="text-base font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-2"
                        title={post.title}
                      >
                        {post.title}
                      </h3>

                      <p className="text-surface-400 text-xs line-clamp-2 leading-relaxed">
                        {post.excerpt || truncate(post.content, 120)}
                      </p>
                    </div>

                    {/* Tags Preview */}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-surface-950 text-surface-400 border border-surface-800"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-[10px] text-surface-500 px-1">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata: Date and Reading Time */}
                    <div className="pt-2 border-t border-surface-800/80 flex items-center justify-between text-[11px] text-surface-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-surface-400" />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-surface-400" />
                        <span>{post.reading_time || calculateReadingTime(post.content)} min read</span>
                      </div>
                    </div>

                    {/* Actions: Edit, Delete, Publish, Archive */}
                    <div className="pt-3 border-t border-surface-800/60 flex items-center justify-between gap-2">
                      {/* Status Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {post.status !== 'published' ? (
                          <button
                            onClick={() => handleQuickStatusChange(post, 'published')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/40 transition-colors"
                            title="Publish article to live site"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(post, 'draft')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-950/60 border border-amber-800/40 transition-colors"
                            title="Revert to draft"
                          >
                            <span>Draft</span>
                          </button>
                        )}

                        {post.status !== 'archived' && (
                          <button
                            onClick={() => handleQuickStatusChange(post, 'archived')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 transition-colors"
                            title="Archive article"
                          >
                            <Archive className="w-3 h-3" />
                            <span className="hidden sm:inline">Archive</span>
                          </button>
                        )}
                      </div>

                      {/* Icon Actions: Preview, Edit, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewingPost(post)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                          title="Preview article"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(post)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-950/40 transition-colors"
                          title="Edit article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          NEW / EDIT ARTICLE MODAL (Full featured with Markdown Preview)
          ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-surface-900 border border-surface-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between bg-surface-900/90 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingPostId ? 'Edit Article' : 'New Article'}
                  </h2>
                  <p className="text-xs text-surface-400">
                    {editingPostId
                      ? 'Update content, tags, or publishing status'
                      : 'Draft and publish a new technical story or tutorial'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Row 1: Title and Auto Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-300 flex items-center justify-between">
                    <span>Title <span className="text-red-400">*</span></span>
                    <span className="text-[11px] text-surface-500">{formData.title.length} characters</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Deep Dive into React 19 Server Components"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-300 flex items-center justify-between">
                    <span>URL Slug <span className="text-red-400">*</span></span>
                    <span className="text-[11px] text-surface-500">Auto-generated from title</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="deep-dive-into-react-19-server-components"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-primary-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <p className="text-[11px] text-surface-500 truncate">
                    Preview URL: <span className="text-surface-400">/blog/{formData.slug || 'your-slug'}</span>
                  </p>
                </div>
              </div>

              {/* Row 2: Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-300">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value as CategoryType }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as 'draft' | 'published' | 'archived',
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="archived">Archived (Hidden)</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-xs font-semibold text-surface-300">Featured Post</label>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-950 border border-surface-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-surface-700 bg-surface-900"
                    />
                    <span className="text-xs text-surface-300 font-medium flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${formData.featured ? 'text-amber-400 fill-amber-400' : 'text-surface-500'}`} />
                      Highlight on Homepage
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 3: Cover Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-300 flex items-center justify-between">
                  <span>Cover Image URL</span>
                  <span className="text-[11px] text-surface-500">Unsplash or CDN image link</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.cover_image_url}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-surface-950 border border-surface-800 text-white placeholder-surface-500 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                    <Image className="w-4 h-4 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {formData.cover_image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, cover_image_url: '' }))}
                      className="px-3 py-2 text-xs rounded-xl bg-surface-800 text-surface-400 hover:text-white border border-surface-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {formData.cover_image_url && (
                  <div className="relative mt-2 h-28 rounded-xl overflow-hidden border border-surface-800 bg-surface-950 max-w-sm">
                    <img
                      src={formData.cover_image_url}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-surface-300">
                      Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Row 4: Excerpt */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-300 flex items-center justify-between">
                  <span>Excerpt / Summary</span>
                  <span className="text-[11px] text-surface-500">
                    Recommended 120-160 chars for SEO ({formData.excerpt.length} chars)
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="A concise summary of what this article covers for preview cards and social shares..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-white placeholder-surface-500 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed resize-none"
                />
              </div>

              {/* Row 5: Tags (comma-separated) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-300 flex items-center justify-between">
                  <span>Tags (Comma-separated)</span>
                  <span className="text-[11px] text-surface-500">e.g., React, TypeScript, Performance</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="React, TypeScript, Next.js, Architecture"
                    value={formData.tagsString}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tagsString: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-surface-950 border border-surface-800 text-white placeholder-surface-500 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Interactive tag chips preview */}
                {formData.tagsString.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tagsString
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary-950/60 text-primary-300 border border-primary-800/40"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentTags = formData.tagsString
                                .split(',')
                                .map((t) => t.trim())
                                .filter((t) => t.length > 0 && t !== tag);
                              setFormData((prev) => ({
                                ...prev,
                                tagsString: currentTags.join(', '),
                              }));
                            }}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Row 6: Content Editor (Markdown Supported with Preview Tab) */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-surface-300">
                      Content (Markdown Supported) <span className="text-red-400">*</span>
                    </span>
                    <span className="text-[11px] text-surface-500 bg-surface-950 px-2 py-0.5 rounded border border-surface-800">
                      ~{calculateReadingTime(formData.content)} min read
                    </span>
                  </div>

                  {/* Tabs: Write vs Preview */}
                  <div className="flex items-center gap-1 bg-surface-950 p-1 rounded-lg border border-surface-800">
                    <button
                      type="button"
                      onClick={() => setFormActiveTab('write')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        formActiveTab === 'write'
                          ? 'bg-surface-800 text-white shadow'
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        formActiveTab === 'preview'
                          ? 'bg-primary-600 text-white shadow'
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Quick Toolbar */}
                {formActiveTab === 'write' && (
                  <div className="flex flex-wrap items-center gap-1 bg-surface-950 p-1.5 rounded-t-xl border-x border-t border-surface-800 text-surface-400">
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('**', '**', 'bold text')}
                      className="p-1.5 rounded hover:bg-surface-800 hover:text-white"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('*', '*', 'italic text')}
                      className="p-1.5 rounded hover:bg-surface-800 hover:text-white"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('## ', '', 'Heading 2')}
                      className="p-1.5 rounded hover:bg-surface-800 hover:text-white"
                      title="Heading"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('`', '`', 'inline code')}
                      className="p-1.5 rounded hover:bg-surface-800 hover:text-white"
                      title="Inline Code"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSyntax('```typescript\n', '\n```', '// code block here')
                      }
                      className="px-2 py-1 rounded text-[11px] font-mono hover:bg-surface-800 hover:text-white"
                      title="Code Block"
                    >
                      {'{ }'}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('> ', '', 'Quote block')}
                      className="p-1.5 rounded hover:bg-surface-800 hover:text-white"
                      title="Quote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('- ', '', 'List item')}
                      className="p-1.5 rounded hover:bg-surface-800 hover:text-white"
                      title="Bulleted List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSyntax('[', '](https://example.com)', 'Link Title')}
                      className="px-2 py-1 rounded text-[11px] hover:bg-surface-800 hover:text-white"
                      title="Link"
                    >
                      [Link]
                    </button>
                  </div>
                )}

                {/* Editor Content Area */}
                {formActiveTab === 'write' ? (
                  <textarea
                    ref={contentTextareaRef}
                    required
                    rows={12}
                    placeholder="Write article in markdown... Use # for headers, ``` for code snippets, and > for quotes."
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 rounded-b-xl bg-surface-950 border border-surface-800 text-white placeholder-surface-600 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed resize-y"
                  />
                ) : (
                  <div className="w-full min-h-[300px] max-h-[500px] overflow-y-auto px-6 py-4 rounded-xl bg-surface-950 border border-surface-800 text-surface-200">
                    {formData.content.trim() ? (
                      <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            h1: ({ ...props }) => (
                              <h1 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 border-b border-surface-800 pb-2" {...props} />
                            ),
                            h2: ({ ...props }) => (
                              <h2 className="text-lg sm:text-xl font-bold text-white mt-4 mb-2" {...props} />
                            ),
                            h3: ({ ...props }) => (
                              <h3 className="text-base font-semibold text-surface-200 mt-3 mb-1" {...props} />
                            ),
                            p: ({ ...props }) => (
                              <p className="text-surface-300 leading-relaxed my-2.5" {...props} />
                            ),
                            ul: ({ ...props }) => (
                              <ul className="list-disc list-inside text-surface-300 my-2.5 space-y-1 pl-2" {...props} />
                            ),
                            ol: ({ ...props }) => (
                              <ol className="list-decimal list-inside text-surface-300 my-2.5 space-y-1 pl-2" {...props} />
                            ),
                            blockquote: ({ ...props }) => (
                              <blockquote
                                className="border-l-4 border-primary-500 pl-4 py-1.5 my-3 italic text-surface-400 bg-surface-900/60 rounded-r-lg"
                                {...props}
                              />
                            ),
                            code: ({ inline, children, ...props }: any) => {
                              return inline ? (
                                <code
                                  className="px-1.5 py-0.5 rounded bg-surface-800 text-primary-300 font-mono text-xs border border-surface-700/50"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre className="p-3.5 rounded-xl bg-surface-900 border border-surface-800 overflow-x-auto my-3 font-mono text-xs text-surface-200">
                                  <code {...props}>{children}</code>
                                </pre>
                              );
                            },
                            a: ({ ...props }) => (
                              <a
                                className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {formData.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-surface-600 italic text-center py-12">
                        No content written yet. Switch to the 'Write' tab to start composing.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Note about Supabase Persistence */}
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center gap-2 text-xs text-surface-400">
                <Database className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>
                  Note: Connect Supabase to persist blog posts remotely across devices and production deployments.
                </span>
              </div>

              {/* Form Footer Buttons */}
              <div className="pt-4 border-t border-surface-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-surface-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-xl border border-surface-700 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFormActiveTab(formActiveTab === 'write' ? 'preview' : 'write')}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-xl border border-surface-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formActiveTab === 'write' ? 'Preview' : 'Back to Editor'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full sm:w-auto text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Article...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingPostId ? 'Update Article' : 'Save Article'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Article?</h3>
                <p className="text-xs text-surface-400 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="text-white font-medium">"{postToDelete.title}"</span>?
                </p>
                <p className="text-[11px] text-red-400/90 pt-1">
                  This action cannot be undone and will remove the post from your website.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-800 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-xl border border-surface-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN PREVIEW MODAL
          ========================================================================= */}
      {previewingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-surface-900 border border-surface-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between bg-surface-900/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-400 bg-primary-950/60 px-2.5 py-0.5 rounded-full border border-primary-800/40">
                  {previewingPost.category}
                </span>
                <span className="text-xs text-surface-500">•</span>
                <span className="text-xs text-surface-400">
                  {previewingPost.reading_time || calculateReadingTime(previewingPost.content)} min read
                </span>
              </div>

              <button
                onClick={() => setPreviewingPost(null)}
                className="p-1.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {previewingPost.cover_image_url && (
                <div className="rounded-2xl overflow-hidden border border-surface-800 h-64 bg-surface-950">
                  <img
                    src={previewingPost.cover_image_url}
                    alt={previewingPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {previewingPost.title}
                </h1>
                <p className="text-surface-400 text-xs mt-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(previewingPost.published_at || previewingPost.created_at)}</span>
                  <span>•</span>
                  <span>Status: <strong className="uppercase text-surface-300">{previewingPost.status}</strong></span>
                </p>
              </div>

              {previewingPost.excerpt && (
                <div className="p-4 rounded-xl bg-surface-950 border-l-4 border-primary-500 text-surface-300 text-sm leading-relaxed italic">
                  {previewingPost.excerpt}
                </div>
              )}

              <div className="prose prose-invert max-w-none text-sm text-surface-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-2xl font-bold text-white mt-6 mb-3 border-b border-surface-800 pb-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-xl font-bold text-white mt-5 mb-2.5" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-lg font-semibold text-surface-200 mt-4 mb-2" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-surface-300 leading-relaxed my-3" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc list-inside text-surface-300 my-3 space-y-1.5 pl-2" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal list-inside text-surface-300 my-3 space-y-1.5 pl-2" {...props} />
                    ),
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-surface-400 bg-surface-950/80 rounded-r-xl"
                        {...props}
                      />
                    ),
                    code: ({ inline, children, ...props }: any) => {
                      return inline ? (
                        <code
                          className="px-1.5 py-0.5 rounded bg-surface-800 text-primary-300 font-mono text-xs border border-surface-700/50"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="p-4 rounded-xl bg-surface-950 border border-surface-800 overflow-x-auto my-4 font-mono text-xs text-surface-200">
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {previewingPost.content}
                </ReactMarkdown>
              </div>

              {Array.isArray(previewingPost.tags) && previewingPost.tags.length > 0 && (
                <div className="pt-4 border-t border-surface-800 flex flex-wrap gap-2">
                  {previewingPost.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-surface-950 text-surface-400 border border-surface-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-surface-800 flex items-center justify-between bg-surface-900/90">
              <button
                onClick={() => setPreviewingPost(null)}
                className="px-4 py-2 text-xs font-medium text-surface-300 hover:text-white bg-surface-800 rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const post = previewingPost;
                  setPreviewingPost(null);
                  handleOpenEditModal(post);
                }}
                className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit This Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOAST NOTIFICATIONS CONTAINER
          ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const toastStyles = {
            success: {
              border: 'border-emerald-500/30',
              bg: 'bg-surface-900/95 text-emerald-200',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
            },
            error: {
              border: 'border-red-500/30',
              bg: 'bg-surface-900/95 text-red-200',
              icon: <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
            },
            info: {
              border: 'border-primary-500/30',
              bg: 'bg-surface-900/95 text-primary-200',
              icon: <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0" />,
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-slide-up ${toastStyles.bg} ${toastStyles.border}`}
            >
              <div className="mt-0.5">{toastStyles.icon}</div>
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-bold text-white tracking-wide">{toast.title}</p>
                <p className="text-xs text-surface-300 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-surface-400 hover:text-white p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

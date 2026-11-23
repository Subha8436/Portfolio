import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Service } from '@/types';
import {
  // Navigation & Actions
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  LogOut,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Save,
  Activity,
  // Popular Service Icons
  Bot,
  Briefcase,
  UserCheck,
  Rocket,
  ShoppingCart,
  MessageSquareCode,
  Workflow,
  Network,
  Palette,
  Box,
  Cloud,
  Cpu,
  Globe,
  Sparkles,
  Layers,
  Zap,
  Code2,
  Server,
  Database,
  ShieldCheck,
  Terminal,
  Smartphone,
  Gauge,
  FileCode,
  Store,
  Compass,
  Monitor,
  Headphones,
  type LucideIcon,
} from 'lucide-react';

/**
 * Curated Icon Library for Services
 */
const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  Bot,
  Briefcase,
  UserCheck,
  Rocket,
  ShoppingCart,
  MessageSquareCode,
  Workflow,
  Network,
  Palette,
  Box,
  Cloud,
  Cpu,
  Globe,
  Sparkles,
  Layers,
  Zap,
  Code2,
  Server,
  Database,
  ShieldCheck,
  Terminal,
  Smartphone,
  Gauge,
  FileCode,
  Store,
  Compass,
  Monitor,
  Headphones,
};

/**
 * 11 Default Services matching portfolio i18n and requirements
 */
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-ai-web',
    title: 'AI-Powered Web Applications',
    description:
      'Building intelligent web applications that leverage artificial intelligence for enhanced functionality and user experiences.',
    icon: 'Bot',
    display_order: 1,
    active: true,
  },
  {
    id: 'srv-business',
    title: 'Business Websites',
    description:
      'Professional, responsive websites designed to establish and grow your online presence.',
    icon: 'Briefcase',
    display_order: 2,
    active: true,
  },
  {
    id: 'srv-portfolio',
    title: 'Personal Portfolio Websites',
    description:
      'Stunning portfolio websites that showcase your work and professional identity.',
    icon: 'UserCheck',
    display_order: 3,
    active: true,
  },
  {
    id: 'srv-landing',
    title: 'Landing Page Development',
    description:
      'High-converting landing pages with compelling design and clear calls to action.',
    icon: 'Rocket',
    display_order: 4,
    active: true,
  },
  {
    id: 'srv-ecommerce',
    title: 'E-Commerce Websites',
    description:
      'Online stores with product management, payment integration, and seamless shopping experiences.',
    icon: 'ShoppingCart',
    display_order: 5,
    active: true,
  },
  {
    id: 'srv-chatbot',
    title: 'AI Chatbot Integration',
    description:
      'Intelligent chatbot solutions powered by AI for customer support and engagement.',
    icon: 'MessageSquareCode',
    display_order: 6,
    active: true,
  },
  {
    id: 'srv-automation',
    title: 'Workflow Automation',
    description:
      'Streamlining business processes through automated workflows and integrations.',
    icon: 'Workflow',
    display_order: 7,
    active: true,
  },
  {
    id: 'srv-api',
    title: 'API Integration',
    description:
      'Connecting applications and services through robust API integrations.',
    icon: 'Network',
    display_order: 8,
    active: true,
  },
  {
    id: 'srv-redesign',
    title: 'Website Redesign & UI Improvements',
    description:
      'Modernizing existing websites with improved design, performance, and user experience.',
    icon: 'Palette',
    display_order: 9,
    active: true,
  },
  {
    id: 'srv-interactive',
    title: 'Interactive Animations & 3D Web',
    description:
      'Engaging web experiences with animations, 3D elements, and interactive interfaces.',
    icon: 'Box',
    display_order: 10,
    active: true,
  },
  {
    id: 'srv-saas',
    title: 'SaaS Application Development',
    description:
      'Software-as-a-Service applications with subscription management and scalable architecture.',
    icon: 'Cloud',
    display_order: 11,
    active: true,
  },
];

const LOCAL_STORAGE_KEY = 'subhasish_portfolio_admin_services';

/**
 * Dynamic Icon renderer with safe fallback
 */
interface ServiceIconProps {
  name: string;
  className?: string;
}

const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = 'w-6 h-6' }) => {
  const IconComponent = AVAILABLE_ICONS[name] || Sparkles;
  return <IconComponent className={className} />;
};

/**
 * Toast Notification State
 */
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export default function AdminServices() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const isConfigured = isSupabaseConfigured();

  // State Management
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'error'>('synced');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filtering & View state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'order_asc' | 'order_desc' | 'title_asc' | 'title_desc'>('order_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSqlHelp, setShowSqlHelp] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIcon, setFormIcon] = useState<string>('Sparkles');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});

  // Auth Protection Check
  useEffect(() => {
    // If Supabase is configured and authentication finished, ensure user is signed in
    if (!authLoading && !user && isConfigured) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, authLoading, isConfigured, navigate]);

  // Toast Helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Load Services from Supabase or Local Storage
   */
  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // If Supabase is configured, fetch from Supabase
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Supabase fetch returned error or table not initialized:', error.message);
          // Fallback to local storage or defaults
          loadFromLocalOrDefaults(
            'Connected to Supabase, but "services" table is not found or empty. Using local cache. Check the Supabase Setup Guide below.'
          );
          setSyncStatus('local');
        } else if (data && data.length > 0) {
          // Normalize and sort
          const sorted = [...data].sort((a, b) => a.display_order - b.display_order);
          setServices(sorted);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
          setSyncStatus('synced');
        } else {
          // Table exists but has 0 records -> initialize with 11 defaults
          console.info('Supabase "services" table is empty. Initializing defaults...');
          await seedSupabaseDefaults();
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        loadFromLocalOrDefaults('Error connecting to Supabase. Loaded local data.');
        setSyncStatus('local');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Offline / Local Mode
      loadFromLocalOrDefaults();
      setSyncStatus('local');
      setIsLoading(false);
    }
  }, [isConfigured]);

  const loadFromLocalOrDefaults = (warningMsg?: string) => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed.sort((a: Service, b: Service) => a.display_order - b.display_order));
          if (warningMsg) addToast('info', warningMsg);
          return;
        }
      }
    } catch {
      // Local storage parse failed
    }

    // Default 11 services
    setServices(DEFAULT_SERVICES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
    if (warningMsg) addToast('info', warningMsg);
  };

  const seedSupabaseDefaults = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .upsert(DEFAULT_SERVICES)
        .select();

      if (error) {
        throw error;
      }

      const list = data || DEFAULT_SERVICES;
      const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
      setServices(sorted);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
      setSyncStatus('synced');
      addToast('success', 'Initialized Supabase with 11 default services.');
    } catch (err) {
      console.warn('Could not auto-seed Supabase table:', err);
      setServices(DEFAULT_SERVICES);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
      setSyncStatus('local');
    }
  };

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  /**
   * Sync changes to Supabase (and local storage)
   */
  const persistServices = async (updatedList: Service[], successMessage?: string) => {
    // Keep list sorted by display order
    const sorted = [...updatedList].sort((a, b) => a.display_order - b.display_order);
    setServices(sorted);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));

    if (isConfigured) {
      setIsSyncing(true);
      try {
        const { error } = await supabase.from('services').upsert(sorted);
        if (error) {
          console.error('Failed to sync to Supabase:', error.message);
          setSyncStatus('error');
          addToast('error', `Local change saved, but Supabase sync failed: ${error.message}`);
        } else {
          setSyncStatus('synced');
          if (successMessage) addToast('success', successMessage);
        }
      } catch (err) {
        console.error('Supabase sync error:', err);
        setSyncStatus('error');
        addToast('error', 'Local change saved, but Supabase connection failed.');
      } finally {
        setIsSyncing(false);
      }
    } else {
      setSyncStatus('local');
      if (successMessage) addToast('success', successMessage);
    }
  };

  /**
   * Toggle Service Visibility
   */
  const handleToggleActive = async (service: Service) => {
    const updated = services.map((s) =>
      s.id === service.id ? { ...s, active: !s.active } : s
    );
    const newStatus = !service.active ? 'visible' : 'hidden';
    await persistServices(
      updated,
      `Service "${service.title}" is now ${newStatus} on the site.`
    );
  };

  /**
   * Reorder Services with Up / Down buttons
   */
  const handleMoveService = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === services.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...services];

    // Swap elements in array
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Reassign display_order contiguously 1..N
    const withUpdatedOrders = reordered.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    await persistServices(withUpdatedOrders, `Moved "${temp.title}" ${direction}.`);
  };

  /**
   * Open Add Modal
   */
  const openAddModal = () => {
    const nextOrder = services.length > 0
      ? Math.max(...services.map((s) => s.display_order)) + 1
      : 1;

    setFormTitle('');
    setFormDescription('');
    setFormIcon('Sparkles');
    setFormDisplayOrder(nextOrder);
    setFormActive(true);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  /**
   * Open Edit Modal
   */
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormTitle(service.title);
    setFormDescription(service.description);
    setFormIcon(service.icon || 'Sparkles');
    setFormDisplayOrder(service.display_order);
    setFormActive(service.active);
    setFormErrors({});
  };

  /**
   * Validate Form
   */
  const validateForm = (): boolean => {
    const errors: { title?: string; description?: string } = {};
    if (!formTitle.trim()) {
      errors.title = 'Service title is required';
    } else if (formTitle.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formDescription.trim()) {
      errors.description = 'Description is required';
    } else if (formDescription.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Save New Service
   */
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newId = `srv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newService: Service = {
      id: newId,
      title: formTitle.trim(),
      description: formDescription.trim(),
      icon: formIcon.trim() || 'Sparkles',
      display_order: Number(formDisplayOrder) || services.length + 1,
      active: formActive,
    };

    const updated = [...services, newService];
    await persistServices(updated, `Created new service: "${newService.title}"`);
    setIsAddModalOpen(false);
  };

  /**
   * Save Edited Service
   */
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !validateForm()) return;

    const updated = services.map((s) =>
      s.id === editingService.id
        ? {
            ...s,
            title: formTitle.trim(),
            description: formDescription.trim(),
            icon: formIcon.trim() || 'Sparkles',
            display_order: Number(formDisplayOrder),
            active: formActive,
          }
        : s
    );

    await persistServices(updated, `Saved changes to "${formTitle.trim()}".`);
    setEditingService(null);
  };

  /**
   * Delete Service with Confirmation
   */
  const handleDeleteService = async () => {
    if (!deletingService) return;

    const filtered = services.filter((s) => s.id !== deletingService.id);
    // Renumber display_order
    const reindexed = filtered.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    if (isConfigured) {
      try {
        await supabase.from('services').delete().eq('id', deletingService.id);
      } catch (err) {
        console.warn('Error deleting from Supabase:', err);
      }
    }

    await persistServices(reindexed, `Deleted service: "${deletingService.title}".`);
    setDeletingService(null);
  };

  /**
   * Reset to Default 11 Services
   */
  const handleResetToDefaults = async () => {
    await persistServices(DEFAULT_SERVICES, 'Restored all 11 default portfolio services.');
    setIsResetConfirmOpen(false);
  };

  /**
   * Copy Supabase SQL snippet
   */
  const handleCopySql = () => {
    const sqlCode = `-- Run this in your Supabase SQL Editor:
create table if not exists public.services (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default 'Sparkles',
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.services enable row level security;

-- Public can view active services
drop policy if exists "Allow public read access" on public.services;
create policy "Allow public read access" 
  on public.services for select 
  using (true);

-- Authenticated admins can manage services
drop policy if exists "Allow authenticated admin full access" on public.services;
create policy "Allow authenticated admin full access" 
  on public.services for all 
  to authenticated 
  using (true)
  with check (true);
`;

    navigator.clipboard.writeText(sqlCode).then(() => {
      setCopiedSql(true);
      addToast('success', 'SQL script copied to clipboard!');
      setTimeout(() => setCopiedSql(false), 2500);
    });
  };

  /**
   * Filtered and Sorted Services
   */
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.icon.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((s) => s.active);
    } else if (statusFilter === 'inactive') {
      result = result.filter((s) => !s.active);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'order_asc') return a.display_order - b.display_order;
      if (sortBy === 'order_desc') return b.display_order - a.display_order;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [services, searchQuery, statusFilter, sortBy]);

  const activeCount = useMemo(() => services.filter((s) => s.active).length, [services]);
  const inactiveCount = useMemo(() => services.filter((s) => !s.active).length, [services]);

  // Loading Screen for initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-white p-6">
        <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Verifying Administrator Access...</h2>
        <p className="text-surface-400 text-sm mt-1">Please wait while we confirm your session.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 antialiased selection:bg-primary-500/30 selection:text-white flex flex-col">
      <Helmet>
        <title>Manage Services | Admin Dashboard</title>
        <meta name="description" content="Manage portfolio services, visibility, and ordering." />
      </Helmet>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-surface-900 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-surface-900 border-red-500/40 text-red-300'
                : 'bg-surface-900 border-primary-500/40 text-primary-300'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />}
            <span className="flex-1 leading-snug">{toast.text}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-surface-400 hover:text-white shrink-0 ml-2"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Back to Dashboard */}
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm font-medium py-1.5 px-2.5 rounded-lg hover:bg-surface-850"
                title="Return to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-5 w-px bg-surface-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  Services Manager
                </span>
                {user ? (
                  <span className="text-xs text-surface-400 hidden md:inline">
                    Logged in as: <span className="text-surface-200 font-mono">{user.email}</span>
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Local Admin Mode
                  </span>
                )}
              </div>
            </div>

            {/* Right: Quick actions & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/#services"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-850 rounded-lg transition-colors border border-surface-800"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/admin/login', { replace: true });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors border border-primary-500/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Supabase Connection Alert & Documentation Banner */}
        <div className="mb-8 rounded-2xl bg-surface-900/90 border border-surface-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  isConfigured
                    ? syncStatus === 'synced'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                }`}
              >
                <Database className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-semibold text-white text-base">Supabase Database Connection</h3>
                  {isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Connected to Supabase
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Local Storage Mode (VITE_SUPABASE_URL not configured)
                    </span>
                  )}
                </div>

                <p className="text-surface-400 text-sm mt-1 max-w-3xl leading-relaxed">
                  {isConfigured
                    ? 'All modifications (add, edit, toggle visibility, and reorder) automatically sync to the Supabase `services` table in real time, with immediate local persistence.'
                    : 'Changes are securely saved to your local browser storage. To persist edits permanently into a PostgreSQL cloud database, specify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'}
                </p>
              </div>
            </div>

            {/* Quick Actions for Supabase */}
            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setShowSqlHelp(!showSqlHelp)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-xl transition-colors border border-surface-700"
              >
                <Code2 className="w-4 h-4 text-primary-400" />
                <span>{showSqlHelp ? 'Hide SQL Schema' : 'View SQL Schema'}</span>
              </button>

              <button
                type="button"
                onClick={() => loadServices()}
                disabled={isSyncing || isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-xl transition-colors border border-surface-700 disabled:opacity-50"
                title="Refresh and sync data"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing || isLoading ? 'animate-spin text-primary-400' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>

          {/* Expandable SQL Schema & Migration Helper */}
          {showSqlHelp && (
            <div className="mt-5 pt-5 border-t border-surface-800/80 animate-slide-down">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-primary-300 font-semibold tracking-wider uppercase">
                  PostgreSQL Table Schema & RLS Policies
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 py-1 px-2.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-surface-950 font-mono text-xs text-surface-300 overflow-x-auto border border-surface-800 leading-relaxed">
{`-- Create "services" table in Supabase SQL Editor:
create table if not exists public.services (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default 'Sparkles',
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.services enable row level security;

-- Public can read all active services
create policy "Allow public read access" 
  on public.services for select using (true);

-- Authenticated admins have full read/write access
create policy "Allow authenticated admin full access" 
  on public.services for all to authenticated using (true);`}
              </pre>
            </div>
          )}
        </div>

        {/* Page Header: Manage Services */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Admin Services Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Manage Services
            </h1>
            <p className="text-surface-400 text-sm sm:text-base mt-2 max-w-2xl">
              Configure, reorder, edit, and toggle the active state of all 11 professional service offerings displayed on your public portfolio.
            </p>
          </div>

          {/* Top Actions: Add New Service & Reset Defaults */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-700 text-surface-300 hover:text-white hover:border-surface-600 hover:bg-surface-850 text-sm font-medium transition-all"
              title="Reset to 11 original services"
            >
              <RotateCcw className="w-4 h-4 text-surface-400" />
              <span>Reset 11 Services</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-medium shadow-lg shadow-primary-600/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>
        </div>

        {/* Stats & Overview Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
            <div className="text-surface-400 text-xs font-medium uppercase tracking-wider">Total Services</div>
            <div className="text-2xl font-bold text-white mt-1">{services.length}</div>
            <div className="text-xs text-surface-500 mt-1">Configured items</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
            <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Active on Site
            </div>
            <div className="text-2xl font-bold text-white mt-1">{activeCount}</div>
            <div className="text-xs text-surface-500 mt-1">Visible to clients</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
            <div className="text-amber-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Hidden / Draft
            </div>
            <div className="text-2xl font-bold text-white mt-1">{inactiveCount}</div>
            <div className="text-xs text-surface-500 mt-1">Temporarily disabled</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
            <div className="text-primary-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Sync Status
            </div>
            <div className="text-sm font-semibold text-white mt-2 capitalize flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-primary-400'}`} />
              {isConfigured ? 'Supabase Cloud' : 'Local Storage'}
            </div>
            <div className="text-xs text-surface-500 mt-1">
              {isSyncing ? 'Syncing...' : 'Real-time sync'}
            </div>
          </div>
        </div>

        {/* Filter, Search & Controls Bar */}
        <div className="bg-surface-900/70 border border-surface-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                placeholder="Search services by title, description or icon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
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

            {/* Filter Tabs, Sort Dropdown & View Mode */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Tabs */}
              <div className="inline-flex rounded-xl bg-surface-950 p-1 border border-surface-800">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-surface-800 text-white shadow-sm'
                      : 'text-surface-400 hover:text-surface-200'
                  }`}
                >
                  All ({services.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'text-surface-400 hover:text-surface-200'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'inactive'
                      ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                      : 'text-surface-400 hover:text-surface-200'
                  }`}
                >
                  Hidden ({inactiveCount})
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-surface-500 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-surface-950 border border-surface-800 text-surface-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="order_asc">Display Order (1 → N)</option>
                  <option value="order_desc">Display Order (N → 1)</option>
                  <option value="title_asc">Title (A → Z)</option>
                  <option value="title_desc">Title (Z → A)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl bg-surface-950 p-1 border border-surface-800">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-surface-800 text-white' : 'text-surface-500 hover:text-surface-300'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-surface-800 text-white' : 'text-surface-500 hover:text-surface-300'
                  }`}
                  title="Compact List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services List / Cards Container */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-surface-300 font-medium">Loading portfolio services...</p>
            <p className="text-surface-500 text-xs mt-1">Connecting to Supabase repository</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-20 rounded-2xl bg-surface-900/30 border border-dashed border-surface-800 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-surface-850 flex items-center justify-center text-surface-500 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white">No services found</h3>
            <p className="text-surface-400 text-sm mt-1 max-w-sm">
              {searchQuery
                ? `No service matches "${searchQuery}". Try clearing the search query or changing filters.`
                : 'No services exist under this filter.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-surface-800 text-sm text-surface-200 hover:text-white"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => {
              const originalIndex = services.findIndex((s) => s.id === service.id);
              const isFirst = originalIndex === 0;
              const isLast = originalIndex === services.length - 1;

              return (
                <div
                  key={service.id}
                  className={`group relative rounded-2xl p-6 transition-all duration-300 border flex flex-col justify-between ${
                    service.active
                      ? 'bg-surface-900/90 border-surface-800/90 hover:border-primary-500/50 shadow-lg hover:shadow-xl hover:shadow-primary-500/5'
                      : 'bg-surface-900/40 border-surface-800/40 opacity-75 hover:opacity-100 hover:border-surface-700'
                  }`}
                >
                  {/* Top Bar: Icon, Title & Order Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {/* Icon with gradient container */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                            service.active
                              ? 'bg-gradient-to-br from-primary-600/20 to-accent-600/20 text-primary-400 border border-primary-500/30'
                              : 'bg-surface-800 text-surface-400 border border-surface-700'
                          }`}
                        >
                          <ServiceIcon name={service.icon} className="w-6 h-6" />
                        </div>

                        <div>
                          <span className="text-[11px] font-mono font-medium text-surface-400 uppercase tracking-wider block">
                            Icon: {service.icon || 'Sparkles'}
                          </span>
                          <span className="text-xs font-semibold text-primary-400">
                            #{service.display_order} in showcase
                          </span>
                        </div>
                      </div>

                      {/* Display Order Badge & Reorder Arrows */}
                      <div className="flex items-center bg-surface-950/80 rounded-xl p-1 border border-surface-800">
                        <button
                          type="button"
                          onClick={() => handleMoveService(originalIndex, 'up')}
                          disabled={isFirst}
                          title={isFirst ? 'Already at first position' : 'Move up'}
                          className={`p-1 rounded-lg transition-colors ${
                            isFirst
                              ? 'text-surface-700 cursor-not-allowed'
                              : 'text-surface-400 hover:text-white hover:bg-surface-800'
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold text-surface-300 px-1.5">
                          {service.display_order}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveService(originalIndex, 'down')}
                          disabled={isLast}
                          title={isLast ? 'Already at last position' : 'Move down'}
                          className={`p-1 rounded-lg transition-colors ${
                            isLast
                              ? 'text-surface-700 cursor-not-allowed'
                              : 'text-surface-400 hover:text-white hover:bg-surface-800'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Service Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors leading-snug">
                      {service.title}
                    </h3>

                    {/* Service Description */}
                    <p className="text-surface-300 text-sm mt-2.5 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Card Bottom: Active Toggle & Edit/Delete Actions */}
                  <div className="mt-6 pt-4 border-t border-surface-800/80 flex items-center justify-between gap-3">
                    {/* Active Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(service)}
                      className="inline-flex items-center gap-2 text-xs font-medium focus:outline-none"
                    >
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                          service.active ? 'bg-emerald-600' : 'bg-surface-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            service.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className={service.active ? 'text-emerald-400' : 'text-surface-400'}>
                        {service.active ? 'Active' : 'Hidden'}
                      </span>
                    </button>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-white hover:bg-surface-800 transition-colors border border-surface-750"
                        title="Edit service details"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-primary-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingService(service)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact List View */
          <div className="rounded-2xl border border-surface-800 bg-surface-900/80 overflow-hidden shadow-xl">
            <div className="divide-y divide-surface-800/80">
              {filteredServices.map((service) => {
                const originalIndex = services.findIndex((s) => s.id === service.id);
                const isFirst = originalIndex === 0;
                const isLast = originalIndex === services.length - 1;

                return (
                  <div
                    key={service.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      service.active ? 'hover:bg-surface-850/60' : 'bg-surface-950/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Left: Reorder arrows & Icon & Info */}
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      {/* Reorder Buttons */}
                      <div className="flex sm:flex-col items-center bg-surface-950 rounded-lg p-0.5 border border-surface-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveService(originalIndex, 'up')}
                          disabled={isFirst}
                          className={`p-1 rounded ${
                            isFirst ? 'text-surface-700 cursor-not-allowed' : 'text-surface-400 hover:text-white'
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold text-surface-400 px-1">
                          {service.display_order}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveService(originalIndex, 'down')}
                          disabled={isLast}
                          className={`p-1 rounded ${
                            isLast ? 'text-surface-700 cursor-not-allowed' : 'text-surface-400 hover:text-white'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          service.active
                            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                            : 'bg-surface-800 text-surface-400 border border-surface-700'
                        }`}
                      >
                        <ServiceIcon name={service.icon} className="w-5 h-5" />
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-white truncate">{service.title}</h4>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-800 text-surface-400">
                            {service.icon}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-surface-400 mt-1 line-clamp-1">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Active Toggle, Edit & Delete */}
                    <div className="flex items-center justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-800">
                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(service)}
                        className="inline-flex items-center gap-2 text-xs font-medium focus:outline-none"
                      >
                        <div
                          className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                            service.active ? 'bg-emerald-600' : 'bg-surface-700'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                              service.active ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                        <span className={service.active ? 'text-emerald-400 text-xs' : 'text-surface-400 text-xs'}>
                          {service.active ? 'Active' : 'Hidden'}
                        </span>
                      </button>

                      <div className="h-4 w-px bg-surface-800" />

                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4 text-primary-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingService(service)}
                        className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          ADD NEW SERVICE MODAL
      ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-surface-800 flex items-center justify-between sticky top-0 bg-surface-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Service</h3>
                  <p className="text-xs text-surface-400">Create a new offering for your portfolio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-surface-400 hover:text-white p-1 rounded-lg hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-5">
              {/* Service Title */}
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI-Powered Web Applications"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-surface-950 border ${
                    formErrors.title ? 'border-red-500' : 'border-surface-700'
                  } text-white placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500`}
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              {/* Icon Selector with Preview & Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                    Select Icon
                  </label>
                  <span className="text-xs text-primary-400 font-mono">Current: {formIcon}</span>
                </div>

                {/* Selected Icon preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-950 border border-surface-800 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                    <ServiceIcon name={formIcon} className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Custom icon name or select below"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Popular Icon Grid */}
                <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-surface-950/60 border border-surface-800">
                  {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                    const isSelected = formIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        title={iconName}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-surface-400 hover:text-white hover:bg-surface-800'
                        }`}
                      >
                        <ServiceIcon name={iconName} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                    Description *
                  </label>
                  <span className="text-xs text-surface-500">{formDescription.length} characters</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Detail the value proposition, technologies, and deliverables of this service..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-surface-950 border ${
                    formErrors.description ? 'border-red-500' : 'border-surface-700'
                  } text-white placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 leading-relaxed`}
                />
                {formErrors.description && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-[11px] text-surface-500 mt-1">Numerical sequence on public site</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors ${
                      formActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-surface-800 border-surface-700 text-surface-400'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {formActive ? 'Active (Public)' : 'Hidden (Draft)'}
                    </span>
                    <div
                      className={`w-8 h-4 rounded-full relative flex items-center px-0.5 transition-colors ${
                        formActive ? 'bg-emerald-600' : 'bg-surface-600'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          formActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>
                  <p className="text-[11px] text-surface-500 mt-1">Controls visibility on home page</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-surface-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-medium shadow-md shadow-primary-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT SERVICE MODAL
      ======================================================== */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-surface-800 flex items-center justify-between sticky top-0 bg-surface-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Service</h3>
                  <p className="text-xs text-surface-400">Modify details for &quot;{editingService.title}&quot;</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-surface-400 hover:text-white p-1 rounded-lg hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="p-6 space-y-5">
              {/* Service Title */}
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-surface-950 border ${
                    formErrors.title ? 'border-red-500' : 'border-surface-700'
                  } text-white text-sm focus:outline-none focus:border-primary-500`}
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              {/* Icon Selector with Preview & Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                    Select Icon
                  </label>
                  <span className="text-xs text-primary-400 font-mono">Current: {formIcon}</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-950 border border-surface-800 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                    <ServiceIcon name={formIcon} className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-surface-950/60 border border-surface-800">
                  {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                    const isSelected = formIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        title={iconName}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-surface-400 hover:text-white hover:bg-surface-800'
                        }`}
                      >
                        <ServiceIcon name={iconName} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                    Description *
                  </label>
                  <span className="text-xs text-surface-500">{formDescription.length} characters</span>
                </div>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-surface-950 border ${
                    formErrors.description ? 'border-red-500' : 'border-surface-700'
                  } text-white text-sm focus:outline-none focus:border-primary-500 leading-relaxed`}
                />
                {formErrors.description && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors ${
                      formActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-surface-800 border-surface-700 text-surface-400'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {formActive ? 'Active (Public)' : 'Hidden (Draft)'}
                    </span>
                    <div
                      className={`w-8 h-4 rounded-full relative flex items-center px-0.5 transition-colors ${
                        formActive ? 'bg-emerald-600' : 'bg-surface-600'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          formActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Live Preview
                </label>
                <div className="p-4 rounded-xl bg-surface-950 border border-surface-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center">
                      <ServiceIcon name={formIcon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{formTitle || 'Service Title Preview'}</h4>
                      <span className="text-[11px] text-primary-400 font-mono">Order #{formDisplayOrder}</span>
                    </div>
                  </div>
                  <p className="text-xs text-surface-300 line-clamp-2">
                    {formDescription || 'Service description preview will show here...'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-surface-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-medium shadow-md shadow-primary-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Delete Service</h3>
            <p className="text-surface-400 text-sm mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">&quot;{deletingService.title}&quot;</strong>? This action will remove the service from your website and cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
                className="px-4 py-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteService}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors shadow-lg shadow-red-600/25"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Service</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RESET 11 SERVICES CONFIRMATION MODAL
      ======================================================== */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Reset to 11 Portfolio Services?</h3>
            <p className="text-surface-400 text-sm mt-2 leading-relaxed">
              This will overwrite the current services list with the 11 default portfolio offerings (AI Web Apps, Business Websites, Portfolios, Landing Pages, E-Commerce, Chatbots, Automations, API, Redesigns, 3D Web, and SaaS).
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors shadow-lg shadow-amber-600/25"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { JourneyItem } from '@/types';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  Compass,
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Wrench,
  Briefcase,
  Mail,
  UserCircle,
  ExternalLink,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  Milestone,
  Copy,
  Check,
  Search,
  RotateCcw,
  SlidersHorizontal,
  FileCode,
  Layers
} from 'lucide-react';

const STORAGE_KEY = 'subhasish_portfolio_journey_items';

// 5 default placeholder items from the Journey Section
const DEFAULT_JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: 'journey-1',
    title: 'Started Learning Programming',
    description: 'Began exploring coding through online resources and tutorials.',
    date_label: '2023',
    display_order: 1,
  },
  {
    id: 'journey-2',
    title: 'Built First Web Projects',
    description: 'Created initial web applications using HTML, CSS, and JavaScript.',
    date_label: '2023',
    display_order: 2,
  },
  {
    id: 'journey-3',
    title: 'Discovered Python & Flask',
    description: 'Started backend development and building full-stack applications.',
    date_label: '2024',
    display_order: 3,
  },
  {
    id: 'journey-4',
    title: 'Explored AI & Automation',
    description: 'Began integrating AI APIs and building intelligent applications.',
    date_label: '2024',
    display_order: 4,
  },
  {
    id: 'journey-5',
    title: 'Launched Personal Projects',
    description: 'Published DavaCheck, MealMind AI, WeatherGod, and DotKart.',
    date_label: '2025',
    display_order: 5,
  },
];

interface FormData {
  title: string;
  description: string;
  date_label: string;
  display_order: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  date_label?: string;
  display_order?: string;
}

export default function AdminJourney() {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const supabaseConnected = isSupabaseConfigured();

  // State
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<JourneyItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<JourneyItem | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date_label: '',
    display_order: 1,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Toast notification helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    const timer = setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Save to LocalStorage helper
  const saveToLocalStorage = useCallback((newItems: JourneyItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (err) {
      console.error('Failed to save journey items to localStorage:', err);
    }
  }, []);

  // Fetch journey items from Supabase or LocalStorage
  const fetchJourneyItems = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      if (supabaseConnected) {
        // Attempt query from Supabase
        const { data, error } = await supabase
          .from('journey_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Supabase fetch error for journey_items:', error.message);
          // Fallback to localStorage or defaults
          const savedLocal = localStorage.getItem(STORAGE_KEY);
          if (savedLocal) {
            try {
              const parsed = JSON.parse(savedLocal);
              setItems(parsed.length > 0 ? parsed : DEFAULT_JOURNEY_ITEMS);
            } catch {
              setItems(DEFAULT_JOURNEY_ITEMS);
            }
          } else {
            setItems(DEFAULT_JOURNEY_ITEMS);
            saveToLocalStorage(DEFAULT_JOURNEY_ITEMS);
          }
        } else if (data && data.length > 0) {
          setItems(data as JourneyItem[]);
          saveToLocalStorage(data as JourneyItem[]);
        } else {
          // Table exists but is empty -> seed with defaults
          setItems(DEFAULT_JOURNEY_ITEMS);
          saveToLocalStorage(DEFAULT_JOURNEY_ITEMS);
        }
      } else {
        // Supabase not connected -> use localStorage
        const savedLocal = localStorage.getItem(STORAGE_KEY);
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            setItems(parsed.length > 0 ? parsed : DEFAULT_JOURNEY_ITEMS);
          } catch {
            setItems(DEFAULT_JOURNEY_ITEMS);
          }
        } else {
          setItems(DEFAULT_JOURNEY_ITEMS);
          saveToLocalStorage(DEFAULT_JOURNEY_ITEMS);
        }
      }
    } catch (err) {
      console.error('Error fetching journey items:', err);
      const savedLocal = localStorage.getItem(STORAGE_KEY);
      if (savedLocal) {
        try {
          setItems(JSON.parse(savedLocal));
        } catch {
          setItems(DEFAULT_JOURNEY_ITEMS);
        }
      } else {
        setItems(DEFAULT_JOURNEY_ITEMS);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [supabaseConnected, saveToLocalStorage]);

  // Initial load
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchJourneyItems();
    }
  }, [authLoading, user, isAdmin, fetchJourneyItems]);

  // Sorted items by display_order
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.display_order - b.display_order);
  }, [items]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems;
    const query = searchQuery.toLowerCase().trim();
    return sortedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.date_label.toLowerCase().includes(query)
    );
  }, [sortedItems, searchQuery]);

  // Sync / Persist full list to Supabase if connected and update LocalStorage
  const persistChanges = async (updatedItems: JourneyItem[], successMsg?: string) => {
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    if (!supabaseConnected) {
      if (successMsg) showToast(successMsg, 'success');
      return;
    }

    setIsSaving(true);
    try {
      // Upsert into Supabase
      const { error } = await supabase
        .from('journey_items')
        .upsert(
          updatedItems.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            date_label: item.date_label,
            display_order: item.display_order,
          })),
          { onConflict: 'id' }
        );

      if (error) {
        console.warn('Supabase upsert warning:', error.message);
        showToast(
          'Saved locally. Supabase table "journey_items" may need to be created.',
          'info'
        );
      } else {
        if (successMsg) {
          showToast(`${successMsg} (Synced to Supabase)`, 'success');
        }
      }
    } catch (err) {
      console.error('Error updating Supabase:', err);
      showToast('Saved locally. Cloud sync failed.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Item: Move Up
  const handleMoveUp = async (itemId: string) => {
    const currentIndex = sortedItems.findIndex((it) => it.id === itemId);
    if (currentIndex <= 0) return; // Already at top

    const prevItem = sortedItems[currentIndex - 1];
    const currentItem = sortedItems[currentIndex];

    // Swap display orders
    const newItems = items.map((it) => {
      if (it.id === currentItem.id) {
        return { ...it, display_order: prevItem.display_order };
      }
      if (it.id === prevItem.id) {
        return { ...it, display_order: currentItem.display_order };
      }
      return it;
    });

    await persistChanges(newItems, `Moved "${currentItem.title}" up.`);
  };

  // Reorder Item: Move Down
  const handleMoveDown = async (itemId: string) => {
    const currentIndex = sortedItems.findIndex((it) => it.id === itemId);
    if (currentIndex < 0 || currentIndex >= sortedItems.length - 1) return; // Already at bottom

    const nextItem = sortedItems[currentIndex + 1];
    const currentItem = sortedItems[currentIndex];

    // Swap display orders
    const newItems = items.map((it) => {
      if (it.id === currentItem.id) {
        return { ...it, display_order: nextItem.display_order };
      }
      if (it.id === nextItem.id) {
        return { ...it, display_order: currentItem.display_order };
      }
      return it;
    });

    await persistChanges(newItems, `Moved "${currentItem.title}" down.`);
  };

  // Normalize display order numbers sequentially 1..N
  const handleNormalizeOrders = async () => {
    const normalized = sortedItems.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));
    await persistChanges(normalized, 'Re-sequenced all milestone display orders (1 to N).');
  };

  // Reset to default 5 milestones
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Are you sure you want to restore the 5 default learning journey milestones? Any custom milestones will be replaced.'
      )
    ) {
      await persistChanges(DEFAULT_JOURNEY_ITEMS, 'Restored 5 default journey milestones.');
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    const maxOrder = items.reduce((max, it) => Math.max(max, it.display_order || 0), 0);
    setFormData({
      title: '',
      description: '',
      date_label: new Date().getFullYear().toString(),
      display_order: maxOrder + 1,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: JourneyItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      date_label: item.date_label,
      display_order: item.display_order,
    });
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.date_label.trim()) {
      errors.date_label = 'Date label is required (e.g., 2024, Q3 2025)';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters';
    }

    if (!formData.display_order || isNaN(formData.display_order) || formData.display_order < 1) {
      errors.display_order = 'Display order must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save (Add or Edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingItem) {
      // Editing existing item
      const updatedList = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              title: formData.title.trim(),
              description: formData.description.trim(),
              date_label: formData.date_label.trim(),
              display_order: Number(formData.display_order),
            }
          : it
      );
      await persistChanges(updatedList, `Updated "${formData.title.trim()}"`);
      setEditingItem(null);
    } else {
      // Adding new item
      const newId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `journey-${Date.now()}`;

      const newItem: JourneyItem = {
        id: newId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        date_label: formData.date_label.trim(),
        display_order: Number(formData.display_order),
      };

      const updatedList = [...items, newItem];
      await persistChanges(updatedList, `Added "${newItem.title}" to learning journey.`);
      setIsAddModalOpen(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const remaining = items.filter((it) => it.id !== itemToDelete.id);

    // If connected to Supabase, delete from DB
    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('journey_items')
          .delete()
          .eq('id', itemToDelete.id);
        if (error) {
          console.warn('Supabase delete error:', error.message);
        }
      } catch (err) {
        console.error('Error deleting from Supabase:', err);
      }
    }

    await persistChanges(remaining, `Deleted "${itemToDelete.title}".`);
    setItemToDelete(null);
  };

  // SQL migration copy helper
  const sqlSnippet = `-- Supabase Table Schema for Journey Items
CREATE TABLE IF NOT EXISTS journey_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_label TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE journey_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for portfolio visitors)
CREATE POLICY "Allow public read access" ON journey_items
  FOR SELECT USING (true);

-- Allow authenticated admin full access (insert/update/delete)
CREATE POLICY "Allow authenticated admin full access" ON journey_items
  FOR ALL USING (auth.role() = 'authenticated');`;

  const copySqlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlSnippet);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
      showToast('SQL schema copied to clipboard!', 'info');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Auth Guard
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200">
      <Helmet>
        <title>Manage Learning Journey | Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding & Public link */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="group flex items-center gap-2 text-surface-400 hover:text-white transition-colors"
                title="View Live Portfolio"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
                  SP
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-white tracking-wide">
                    Subhasish Portfolio
                  </div>
                  <div className="text-xs text-surface-400 flex items-center gap-1">
                    <span>Admin Panel</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                to="/admin/projects"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                Projects
              </Link>
              <Link
                to="/admin/blog"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Blog
              </Link>
              <Link
                to="/admin/skills"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                Skills
              </Link>
              <Link
                to="/admin/services"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Services
              </Link>
              <Link
                to="/admin/messages"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Messages
              </Link>
              <Link
                to="/admin/profile"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <UserCircle className="w-3.5 h-3.5" />
                Profile
              </Link>
              <Link
                to="/admin/journey"
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-primary-600/20 border border-primary-500/30 text-primary-300 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-primary-400" />
                Journey
              </Link>
            </nav>

            {/* Right: User Email, Sign Out & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-surface-400 bg-surface-900/60 px-2.5 py-1.5 rounded-md border border-surface-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[140px] text-surface-300">{user.email}</span>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/admin/login');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-red-400 hover:bg-red-500/10 border border-surface-800 hover:border-red-500/30 transition-all"
                title="Sign out of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-surface-900 text-surface-400 hover:text-white border border-surface-800"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-800 bg-surface-950 px-4 pt-3 pb-4 space-y-1">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/admin/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <FolderGit2 className="w-4 h-4" />
              Projects
            </Link>
            <Link
              to="/admin/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
            <Link
              to="/admin/skills"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <Wrench className="w-4 h-4" />
              Skills
            </Link>
            <Link
              to="/admin/services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <Briefcase className="w-4 h-4" />
              Services
            </Link>
            <Link
              to="/admin/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <Mail className="w-4 h-4" />
              Messages
            </Link>
            <Link
              to="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-surface-300 hover:bg-surface-900 hover:text-white"
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </Link>
            <Link
              to="/admin/journey"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold bg-primary-600/20 text-primary-400 border border-primary-500/30"
            >
              <Compass className="w-4 h-4" />
              Journey
            </Link>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supabase Connection Status Banner */}
        <div className="mb-6">
          {supabaseConnected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-900/60 border border-emerald-500/30 text-surface-300 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Connected
                  </div>
                  <p className="text-surface-400 mt-0.5 text-[11px] sm:text-xs">
                    Changes sync in real-time with the <code className="px-1.5 py-0.5 bg-surface-800 rounded text-emerald-300 font-mono">journey_items</code> table.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => fetchJourneyItems(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium transition-colors border border-surface-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary-400' : ''}`} />
                  Sync Now
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-surface-300 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-amber-400 mr-2">Note about Supabase connection:</span>
                    <span className="text-surface-300">
                      Connect Supabase to persist changes across browser sessions and deploy to production.
                    </span>
                    <p className="text-surface-400 mt-1 text-[11px] sm:text-xs">
                      Currently running in local preview mode with LocalStorage persistence. Add your <code className="px-1 bg-surface-800 rounded font-mono text-amber-300">VITE_SUPABASE_URL</code> and <code className="px-1 bg-surface-800 rounded font-mono text-amber-300">VITE_SUPABASE_ANON_KEY</code> in <code className="px-1 bg-surface-800 rounded font-mono text-amber-300">.env</code> to activate live cloud database synchronization.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSqlGuide(!showSqlGuide)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors shrink-0"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  {showSqlGuide ? 'Hide SQL Schema' : 'View SQL Table Setup'}
                </button>
              </div>

              {/* Expandable SQL schema guide */}
              {showSqlGuide && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-amber-300 font-medium">
                      Supabase SQL Table Definition:
                    </span>
                    <button
                      onClick={copySqlToClipboard}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs transition-colors"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-surface-950/90 rounded-lg border border-surface-800 font-mono text-[11px] text-surface-300 overflow-x-auto leading-relaxed">
                    {sqlSnippet}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-mono font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Timeline Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Manage Learning Journey
            </h1>
            <p className="mt-1 text-sm text-surface-400 max-w-2xl">
              Organize milestones, descriptions, date badges, and timeline sequence order for your portfolio's Learning Journey section.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleNormalizeOrders}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-900 hover:bg-surface-800 text-surface-300 border border-surface-800 text-xs font-medium transition-colors"
              title="Ensure all display order numbers are cleanly sequenced 1, 2, 3..."
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-surface-400" />
              <span className="hidden sm:inline">Normalize Order</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-900 hover:bg-surface-800 text-surface-300 border border-surface-800 text-xs font-medium transition-colors"
              title="Restore initial 5 learning journey items"
            >
              <RotateCcw className="w-3.5 h-3.5 text-surface-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Journey Item</span>
            </button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 p-3 bg-surface-900/40 rounded-xl border border-surface-800">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search by title, description, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-surface-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Milestone className="w-3.5 h-3.5 text-primary-400" />
              <span>Total Milestones: <strong className="text-white">{items.length}</strong></span>
            </div>
            {isSaving && (
              <span className="flex items-center gap-1 text-primary-400 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
          </div>
        </div>

        {/* Timeline Items Listing */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mb-3" />
            <p className="text-sm text-surface-400">Loading Journey Milestones...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 px-4 bg-surface-900/30 rounded-2xl border border-dashed border-surface-800 text-center">
            <Compass className="w-12 h-12 text-surface-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">
              {searchQuery ? 'No matching milestones found' : 'No journey milestones yet'}
            </h3>
            <p className="text-sm text-surface-400 max-w-md mx-auto mb-5">
              {searchQuery
                ? `No milestone matches "${searchQuery}". Try a different keyword.`
                : 'Start documenting your learning path by adding your first milestone or restore the default placeholders.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-800 text-surface-200 text-xs font-medium hover:bg-surface-700"
                >
                  Clear Search
                </button>
              ) : (
                <>
                  <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition-colors"
                  >
                    Add Milestone
                  </button>
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-medium transition-colors border border-surface-700"
                  >
                    Restore Defaults
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Visual Timeline Spine Line */}
            <div className="hidden md:block absolute left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500/50 to-surface-800 pointer-events-none" />

            <div className="space-y-4">
              {filteredItems.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredItems.length - 1;

                return (
                  <div
                    key={item.id}
                    className="relative group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 sm:p-5 bg-surface-900/60 hover:bg-surface-900/90 rounded-2xl border border-surface-800/80 hover:border-surface-700 transition-all duration-200 shadow-sm"
                  >
                    {/* Milestone Order Marker */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative z-10 w-11 h-11 rounded-xl bg-gradient-to-br from-surface-800 to-surface-900 border border-primary-500/30 flex flex-col items-center justify-center text-center shadow-md">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400 leading-none">
                          Step
                        </span>
                        <span className="text-sm font-bold text-primary-400 font-mono leading-none mt-0.5">
                          #{item.display_order}
                        </span>
                      </div>

                      {/* Date Badge on Mobile */}
                      <span className="inline-flex md:hidden items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.date_label}
                      </span>
                    </div>

                    {/* Milestone Details */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <h3 className="text-base sm:text-lg font-semibold text-white font-display tracking-tight">
                          {item.title}
                        </h3>

                        {/* Date badge on Desktop */}
                        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 font-mono">
                          <Calendar className="w-3 h-3" />
                          {item.date_label}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-3xl">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Controls: Reorder Up/Down, Edit, Delete */}
                    <div className="flex items-center justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-surface-800/80 gap-2 shrink-0">
                      {/* Reorder Buttons */}
                      <div className="flex items-center bg-surface-950/80 rounded-lg p-1 border border-surface-800">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(item.id)}
                          disabled={isFirst}
                          className="p-1.5 rounded text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move milestone up in timeline"
                          aria-label={`Move milestone ${item.title} up`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(item.id)}
                          disabled={isLast}
                          className="p-1.5 rounded text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move milestone down in timeline"
                          aria-label={`Move milestone ${item.title} down`}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium border border-surface-700 transition-colors"
                        title="Edit milestone details"
                      >
                        <Pencil className="w-3.5 h-3.5 text-primary-400" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Milestone Modal */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">
                    {editingItem ? 'Edit Journey Milestone' : 'Add Journey Milestone'}
                  </h2>
                  <p className="text-xs text-surface-400">
                    {editingItem
                      ? 'Modify details and timeline sequence order'
                      : 'Create a new milestone for the timeline'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                  Milestone Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Discovered Python & Flask"
                  className={`w-full px-3.5 py-2.5 bg-surface-950 border rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none transition-colors ${
                    formErrors.title
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-surface-800 focus:border-primary-500'
                  }`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Grid: Date Label & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Label */}
                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                    Date Label <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      type="text"
                      value={formData.date_label}
                      onChange={(e) => setFormData({ ...formData, date_label: e.target.value })}
                      placeholder="e.g. 2024 or Q2 2025"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-surface-950 border rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none transition-colors ${
                        formErrors.date_label
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-surface-800 focus:border-primary-500'
                      }`}
                    />
                  </div>
                  {formErrors.date_label && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.date_label}
                    </p>
                  )}
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                    Display Order <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className={`w-full px-3.5 py-2.5 bg-surface-950 border rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none transition-colors font-mono ${
                      formErrors.display_order
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-surface-800 focus:border-primary-500'
                    }`}
                  />
                  {formErrors.display_order && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.display_order}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your achievements, technologies learned, or project milestones..."
                  className={`w-full px-3.5 py-2.5 bg-surface-950 border rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none transition-colors leading-relaxed resize-none ${
                    formErrors.description
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-surface-800 focus:border-primary-500'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-surface-400 block mb-1.5">
                  Timeline Card Preview
                </span>
                <div className="p-3 bg-surface-950 rounded-xl border border-surface-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-800 border border-primary-500/30 flex items-center justify-center font-mono text-xs font-bold text-primary-400 shrink-0">
                    #{formData.display_order || 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate">
                        {formData.title || 'Milestone Title'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-500/10 text-primary-400 border border-primary-500/20 font-mono shrink-0">
                        {formData.date_label || 'YYYY'}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 mt-1 line-clamp-2">
                      {formData.description || 'Description of milestone and learning achievements...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-semibold shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                  {editingItem ? 'Save Changes' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Delete Journey Milestone?</h3>
            <p className="text-sm text-surface-400 mb-4">
              Are you sure you want to delete <strong className="text-white">"{itemToDelete.title}"</strong> ({itemToDelete.date_label})? This action will remove it from the timeline.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition-colors"
              >
                Yes, Delete Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white text-xs shadow-2xl animate-slide-up">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-primary-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span className="flex-1 text-surface-200">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-surface-400 hover:text-white ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

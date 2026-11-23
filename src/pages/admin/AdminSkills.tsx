import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Skill } from '@/types';
import {
  Wrench,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Search,
  Sparkles,
  Layers,
  ArrowLeft,
  X,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
  Info,
  RotateCcw
} from 'lucide-react';

// Categories strictly as specified in the master plan & requirements
export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'AI & Automation',
  'Development & Deployment Tools',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

// Pre-populated initial skills from the portfolio specification
export const INITIAL_SKILLS: Skill[] = [
  // Frontend
  {
    id: 'skill-html5',
    category: 'Frontend',
    name: 'HTML5',
    icon: '🌐',
    display_order: 1,
    active: true,
  },
  {
    id: 'skill-css3',
    category: 'Frontend',
    name: 'CSS3',
    icon: '🎨',
    display_order: 2,
    active: true,
  },
  {
    id: 'skill-javascript',
    category: 'Frontend',
    name: 'JavaScript',
    icon: '⚡',
    display_order: 3,
    active: true,
  },

  // Backend
  {
    id: 'skill-python',
    category: 'Backend',
    name: 'Python',
    icon: '🐍',
    display_order: 1,
    active: true,
  },
  {
    id: 'skill-flask',
    category: 'Backend',
    name: 'Flask',
    icon: '🧪',
    display_order: 2,
    active: true,
  },

  // Database
  {
    id: 'skill-supabase',
    category: 'Database',
    name: 'Supabase',
    icon: '⚡',
    display_order: 1,
    active: true,
  },
  {
    id: 'skill-mysql',
    category: 'Database',
    name: 'MySQL',
    icon: '🐬',
    display_order: 2,
    active: true,
  },

  // AI & Automation
  {
    id: 'skill-gemini',
    category: 'AI & Automation',
    name: 'Google Gemini API',
    icon: '✨',
    display_order: 1,
    active: true,
  },
  {
    id: 'skill-prompt',
    category: 'AI & Automation',
    name: 'Prompt Engineering',
    icon: '🧠',
    display_order: 2,
    active: true,
  },
  {
    id: 'skill-workflow',
    category: 'AI & Automation',
    name: 'Workflow Automation',
    icon: '⚙️',
    display_order: 3,
    active: true,
  },

  // Development & Deployment Tools
  {
    id: 'skill-git',
    category: 'Development & Deployment Tools',
    name: 'Git',
    icon: '🌿',
    display_order: 1,
    active: true,
  },
  {
    id: 'skill-github',
    category: 'Development & Deployment Tools',
    name: 'GitHub',
    icon: '🐙',
    display_order: 2,
    active: true,
  },
  {
    id: 'skill-termux',
    category: 'Development & Deployment Tools',
    name: 'Termux',
    icon: '📱',
    display_order: 3,
    active: true,
  },
  {
    id: 'skill-netlify',
    category: 'Development & Deployment Tools',
    name: 'Netlify',
    icon: '🌐',
    display_order: 4,
    active: true,
  },
  {
    id: 'skill-vercel',
    category: 'Development & Deployment Tools',
    name: 'Vercel',
    icon: '▲',
    display_order: 5,
    active: true,
  },
  {
    id: 'skill-vscode',
    category: 'Development & Deployment Tools',
    name: 'VS Code',
    icon: '💻',
    display_order: 6,
    active: true,
  },
  {
    id: 'skill-antigravity',
    category: 'Development & Deployment Tools',
    name: 'Google Antigravity',
    icon: '🚀',
    display_order: 7,
    active: true,
  },
];

// Quick emoji suggestions for tech skills
const EMOJI_PALETTE = [
  '🌐', '🎨', '⚡', '🐍', '🧪', '🐬', '✨', '🧠', '⚙️', '🌿',
  '🐙', '📱', '▲', '💻', '🚀', '🔥', '💎', '🛡️', '📦', '🎯',
  '☕', '🦀', '🐘', '🍃', '🐳', '🛠️', '📊', '☁️', '🔗', '🤖'
];

// Visual styling metadata per category
const CATEGORY_META: Record<
  SkillCategory,
  { label: string; badgeClass: string; borderClass: string; bgClass: string; icon: string }
> = {
  'Frontend': {
    label: 'Frontend',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/30',
    bgClass: 'from-blue-500/10 via-surface-900 to-surface-900',
    icon: '💻',
  },
  'Backend': {
    label: 'Backend',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/30',
    bgClass: 'from-emerald-500/10 via-surface-900 to-surface-900',
    icon: '⚙️',
  },
  'Database': {
    label: 'Database',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/30',
    bgClass: 'from-amber-500/10 via-surface-900 to-surface-900',
    icon: '🗄️',
  },
  'AI & Automation': {
    label: 'AI & Automation',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/30',
    bgClass: 'from-purple-500/10 via-surface-900 to-surface-900',
    icon: '✨',
  },
  'Development & Deployment Tools': {
    label: 'Development & Deployment Tools',
    badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    borderClass: 'border-pink-500/30',
    bgClass: 'from-pink-500/10 via-surface-900 to-surface-900',
    icon: '🛠️',
  },
};

const LOCAL_STORAGE_KEY = 'subhasish_admin_skills';

export default function AdminSkills() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const supabaseConfigured = isSupabaseConfigured();

  // Core Data States
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [syncingCloud, setSyncingCloud] = useState<boolean>(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Add Skill Form State
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Frontend');
  const [newSkillIcon, setNewSkillIcon] = useState<string>('⚡');
  const [newSkillOrder, setNewSkillOrder] = useState<number>(1);
  const [newSkillActive, setNewSkillActive] = useState<boolean>(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [addFormError, setAddFormError] = useState<string>('');

  // Edit Modal State
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editFormError, setEditFormError] = useState<string>('');

  // Delete Confirmation State
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  // Toast / Notification State
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Drag and Drop tracking
  const [draggedSkillId, setDraggedSkillId] = useState<string | null>(null);
  const [dragOverSkillId, setDragOverSkillId] = useState<string | null>(null);

  // Reference for auto-focusing on Add Form
  const addNameInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Auth Guard & Initial Load
  useEffect(() => {
    if (authLoading) return;

    if (supabaseConfigured && !user && !isAdmin) {
      navigate('/admin/login');
      return;
    }

    loadSkills();
  }, [authLoading, user, isAdmin, supabaseConfigured, navigate]);

  // Next order helper for selected category
  useEffect(() => {
    const categorySkills = skills.filter((s) => s.category === newSkillCategory);
    const maxOrder = categorySkills.length > 0 ? Math.max(...categorySkills.map((s) => s.display_order)) : 0;
    setNewSkillOrder(maxOrder + 1);
  }, [newSkillCategory, skills]);

  // 1. Load Skills from Supabase or LocalStorage
  const loadSkills = async () => {
    setLoadingData(true);
    try {
      let loadedSkills: Skill[] | null = null;

      // Try LocalStorage first
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedSkills = parsed;
          }
        } catch (e) {
          console.warn('Failed to parse cached skills:', e);
        }
      }

      // If Supabase is configured, fetch from remote database
      if (supabaseConfigured) {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('category', { ascending: true })
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Could not load skills from Supabase:', error.message);
        } else if (data && data.length > 0) {
          loadedSkills = data as Skill[];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } else if (data && data.length === 0 && !loadedSkills) {
          // If remote table is empty, seed with initial skills
          await seedSupabaseSkills(INITIAL_SKILLS);
          loadedSkills = INITIAL_SKILLS;
        }
      }

      // Default to initial skills if nothing loaded
      const finalSkills = loadedSkills || INITIAL_SKILLS;
      setSkills(finalSkills);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalSkills));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading skills:', err);
      setSkills(INITIAL_SKILLS);
    } finally {
      setLoadingData(false);
    }
  };

  // Seed initial skills to Supabase
  const seedSupabaseSkills = async (items: Skill[]) => {
    if (!supabaseConfigured) return;
    try {
      const { error } = await supabase.from('skills').upsert(items);
      if (error) {
        console.warn('Could not seed initial skills to Supabase:', error.message);
      }
    } catch (e) {
      console.error('Seed exception:', e);
    }
  };

  // Helper to persist updated list to LocalStorage & Supabase
  const persistSkills = async (updatedSkills: Skill[], successFeedback?: string) => {
    setSkills(updatedSkills);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSkills));
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSaved(nowTime);

    if (supabaseConfigured) {
      try {
        const { error } = await supabase.from('skills').upsert(updatedSkills);
        if (error) {
          console.warn('Supabase sync warning:', error.message);
          setToastMessage({
            type: 'info',
            text: `Saved locally! (Supabase sync: ${error.message})`,
          });
          return;
        }
      } catch (err) {
        console.error('Error syncing skills to Supabase:', err);
      }
    }

    if (successFeedback) {
      setToastMessage({
        type: 'success',
        text: successFeedback,
      });
    }
  };

  // 2. Add New Skill Handler
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError('');

    const trimmedName = newSkillName.trim();
    if (!trimmedName) {
      setAddFormError('Skill name is required.');
      return;
    }

    const trimmedIcon = newSkillIcon.trim() || '⚡';
    const parsedOrder = Number(newSkillOrder) || 1;

    // Check for duplicate name in same category
    const isDuplicate = skills.some(
      (s) => s.category === newSkillCategory && s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setAddFormError(`"${trimmedName}" already exists in ${newSkillCategory}.`);
      return;
    }

    const newSkill: Skill = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: trimmedName,
      category: newSkillCategory,
      icon: trimmedIcon,
      display_order: parsedOrder,
      active: newSkillActive,
    };

    const updated = [...skills, newSkill];
    await persistSkills(updated, `Skill "${trimmedName}" added successfully!`);

    // Reset Form
    setNewSkillName('');
    setIsAddFormOpen(false);
  };

  // 3. Edit Skill Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setEditFormError('');

    const trimmedName = editingSkill.name.trim();
    if (!trimmedName) {
      setEditFormError('Skill name cannot be empty.');
      return;
    }

    const trimmedIcon = editingSkill.icon.trim() || '⚡';
    const parsedOrder = Number(editingSkill.display_order) || 1;

    // Check duplicate name excluding self
    const isDuplicate = skills.some(
      (s) =>
        s.id !== editingSkill.id &&
        s.category === editingSkill.category &&
        s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setEditFormError(`Another skill with name "${trimmedName}" exists in ${editingSkill.category}.`);
      return;
    }

    const updated = skills.map((s) =>
      s.id === editingSkill.id
        ? {
            ...editingSkill,
            name: trimmedName,
            icon: trimmedIcon,
            display_order: parsedOrder,
          }
        : s
    );

    await persistSkills(updated, `Skill "${trimmedName}" updated!`);
    setEditingSkill(null);
  };

  // 4. Delete Skill Handler
  const handleDeleteSkill = async () => {
    if (!skillToDelete) return;

    const targetId = skillToDelete.id;
    const targetName = skillToDelete.name;
    const targetCategory = skillToDelete.category;

    const remaining = skills.filter((s) => s.id !== targetId);

    // Re-index remaining skills within that category
    const reindexed = reindexCategoryOrders(remaining, targetCategory);

    setSkills(reindexed);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reindexed));

    if (supabaseConfigured) {
      try {
        await supabase.from('skills').delete().eq('id', targetId);
      } catch (err) {
        console.error('Error deleting skill from Supabase:', err);
      }
    }

    setToastMessage({
      type: 'success',
      text: `Deleted "${targetName}" from ${targetCategory}.`,
    });
    setSkillToDelete(null);
  };

  // 5. Toggle Active / Inactive
  const handleToggleActive = async (skillId: string) => {
    const updated = skills.map((s) => {
      if (s.id === skillId) {
        return { ...s, active: !s.active };
      }
      return s;
    });

    const targetSkill = updated.find((s) => s.id === skillId);
    await persistSkills(
      updated,
      targetSkill ? `${targetSkill.name} is now ${targetSkill.active ? 'Active' : 'Inactive'}` : 'Status updated'
    );
  };

  // 6. Up / Down Reorder Helpers
  const handleMoveOrder = async (skillId: string, direction: 'up' | 'down') => {
    const current = skills.find((s) => s.id === skillId);
    if (!current) return;

    // Get all skills in the same category sorted by display_order
    const categorySkills = skills
      .filter((s) => s.category === current.category)
      .sort((a, b) => a.display_order - b.display_order);

    const currentIndex = categorySkills.findIndex((s) => s.id === skillId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categorySkills.length) {
      return; // already at extreme
    }

    // Swap items in category array
    const swapTarget = categorySkills[targetIndex];
    const newCategorySkills = [...categorySkills];
    newCategorySkills[currentIndex] = swapTarget;
    newCategorySkills[targetIndex] = current;

    // Assign clean sequential 1-based display orders
    const updatedCategoryMap = new Map<string, number>();
    newCategorySkills.forEach((item, index) => {
      updatedCategoryMap.set(item.id, index + 1);
    });

    // Merge back into main list
    const updated = skills.map((s) => {
      if (updatedCategoryMap.has(s.id)) {
        return { ...s, display_order: updatedCategoryMap.get(s.id)! };
      }
      return s;
    });

    await persistSkills(updated);
  };

  // Re-index helper
  const reindexCategoryOrders = (list: Skill[], category: string): Skill[] => {
    const categoryItems = list
      .filter((s) => s.category === category)
      .sort((a, b) => a.display_order - b.display_order);

    const orderMap = new Map<string, number>();
    categoryItems.forEach((item, idx) => {
      orderMap.set(item.id, idx + 1);
    });

    return list.map((s) => {
      if (orderMap.has(s.id)) {
        return { ...s, display_order: orderMap.get(s.id)! };
      }
      return s;
    });
  };

  // 7. HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSkillId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSkillId !== id) {
      setDragOverSkillId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedSkillId(null);
    setDragOverSkillId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetSkillId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedSkillId;
    setDraggedSkillId(null);
    setDragOverSkillId(null);

    if (!sourceId || sourceId === targetSkillId) return;

    const sourceSkill = skills.find((s) => s.id === sourceId);
    const targetSkill = skills.find((s) => s.id === targetSkillId);
    if (!sourceSkill || !targetSkill) return;

    // Same category reordering
    if (sourceSkill.category === targetSkill.category) {
      const categorySkills = skills
        .filter((s) => s.category === sourceSkill.category)
        .sort((a, b) => a.display_order - b.display_order);

      const sourceIdx = categorySkills.findIndex((s) => s.id === sourceId);
      const targetIdx = categorySkills.findIndex((s) => s.id === targetSkillId);

      if (sourceIdx === -1 || targetIdx === -1) return;

      // Remove and insert at new position
      const reordered = [...categorySkills];
      const [removed] = reordered.splice(sourceIdx, 1);
      reordered.splice(targetIdx, 0, removed);

      const orderMap = new Map<string, number>();
      reordered.forEach((s, idx) => {
        orderMap.set(s.id, idx + 1);
      });

      const updated = skills.map((s) => {
        if (orderMap.has(s.id)) {
          return { ...s, display_order: orderMap.get(s.id)! };
        }
        return s;
      });

      await persistSkills(updated, `Reordered skills in ${sourceSkill.category}`);
    } else {
      // Moved across categories
      const targetCategorySkills = skills
        .filter((s) => s.category === targetSkill.category)
        .sort((a, b) => a.display_order - b.display_order);

      const targetIdx = targetCategorySkills.findIndex((s) => s.id === targetSkillId);

      const updatedSourceSkill: Skill = {
        ...sourceSkill,
        category: targetSkill.category,
      };

      const newTargetList = [...targetCategorySkills];
      newTargetList.splice(targetIdx, 0, updatedSourceSkill);

      const updated = skills.map((s) => (s.id === sourceId ? updatedSourceSkill : s));
      const reindexedTarget = reindexCategoryOrders(updated, targetSkill.category);
      const fullyReindexed = reindexCategoryOrders(reindexedTarget, sourceSkill.category);

      await persistSkills(
        fullyReindexed,
        `Moved "${sourceSkill.name}" to ${targetSkill.category}`
      );
    }
  };

  // 8. Reset to Initial Specification Skills
  const handleResetToSpec = () => {
    if (
      window.confirm(
        'Reset all skills to the initial specification? This will overwrite existing custom additions.'
      )
    ) {
      persistSkills(INITIAL_SKILLS, 'Reset skills to initial specification defaults!');
    }
  };

  // 9. Manual Sync to Cloud
  const handleManualSync = async () => {
    if (!supabaseConfigured) {
      setToastMessage({
        type: 'info',
        text: 'Connect Supabase credentials in .env to enable database sync.',
      });
      return;
    }

    setSyncingCloud(true);
    try {
      const { error } = await supabase.from('skills').upsert(skills);
      if (error) {
        throw error;
      }
      setToastMessage({
        type: 'success',
        text: 'All skills successfully synced to Supabase!',
      });
    } catch (err: unknown) {
      console.error('Supabase sync error:', err);
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to sync with Supabase',
      });
    } finally {
      setSyncingCloud(false);
    }
  };

  // Filter skills based on search and selected category
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === 'All' || skill.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, selectedCategoryFilter]);

  // Group filtered skills by category preserving canonical order
  const groupedSkills = useMemo(() => {
    const groups: Record<SkillCategory, Skill[]> = {
      'Frontend': [],
      'Backend': [],
      'Database': [],
      'AI & Automation': [],
      'Development & Deployment Tools': [],
    };

    filteredSkills.forEach((skill) => {
      const cat = skill.category as SkillCategory;
      if (groups[cat]) {
        groups[cat].push(skill);
      } else {
        // Fallback for custom categories
        if (!groups['Development & Deployment Tools']) {
          groups['Development & Deployment Tools'] = [];
        }
        groups['Development & Deployment Tools'].push(skill);
      }
    });

    // Sort items within each category by display_order
    Object.keys(groups).forEach((cat) => {
      groups[cat as SkillCategory].sort((a, b) => a.display_order - b.display_order);
    });

    return groups;
  }, [filteredSkills]);

  // Overall Statistics
  const totalCount = skills.length;
  const activeCount = skills.filter((s) => s.active).length;
  const inactiveCount = totalCount - activeCount;

  // Loading Screen
  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-surface-800" />
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-primary-500" />
        </div>
        <p className="mt-4 font-mono text-sm tracking-wide text-surface-400 animate-pulse">
          Loading Skills Management Center...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 font-sans selection:bg-primary-500/30 selection:text-white pb-24">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-slide-down">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : toastMessage.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-200 shadow-red-950/50'
                : 'bg-primary-950/90 border-primary-500/40 text-primary-200 shadow-primary-950/50'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-primary-400 shrink-0" />}
            <span className="text-sm font-medium">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-surface-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-950/85 backdrop-blur-xl border-b border-surface-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-surface-400 hover:text-white hover:bg-surface-900 border border-transparent hover:border-surface-800 transition-all shrink-0"
              title="Return to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-surface-800 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse shrink-0" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-primary-400 truncate">
                Admin Center
              </span>
              <span className="text-surface-600 text-xs hidden md:inline">/</span>
              <span className="text-xs text-surface-400 hidden md:inline">Skills</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {lastSaved && (
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-surface-400 font-mono">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved at {lastSaved}</span>
              </span>
            )}

            {/* Manual Cloud Sync Button */}
            {supabaseConfigured && (
              <button
                onClick={handleManualSync}
                disabled={syncingCloud}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface-900 hover:bg-surface-800 text-surface-300 border border-surface-800 hover:border-surface-700 transition-all disabled:opacity-50"
                title="Sync skills directly to Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingCloud ? 'animate-spin text-primary-400' : ''}`} />
                <span className="hidden sm:inline">Sync DB</span>
              </button>
            )}

            {/* Reset to Spec Button */}
            <button
              onClick={handleResetToSpec}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface-900 hover:bg-surface-800 text-surface-400 hover:text-surface-200 border border-surface-800 hover:border-surface-700 transition-all"
              title="Reset skills list to default specification"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Spec</span>
            </button>

            {/* Live Portfolio Link */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface-900 hover:bg-surface-800 text-surface-300 hover:text-white border border-surface-800 hover:border-surface-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Heading & Summary Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technical Competencies</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Manage Skills
            </h1>
            <p className="text-surface-400 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
              Curate, categorize, and reorder technical skills displayed across your public portfolio. Reorder with drag-and-drop or up/down controls.
            </p>
          </div>

          {/* Action Button: Add Skill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAddFormOpen(true);
                setTimeout(() => addNameInputRef.current?.focus(), 100);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 border border-primary-400/30 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skill</span>
            </button>
          </div>
        </div>

        {/* Note / Banner: Connect Supabase to Persist Changes */}
        <div className="mt-6">
          <div
            className={`rounded-2xl border p-4 sm:p-5 transition-all ${
              supabaseConfigured
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    supabaseConfigured
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {supabaseConfigured ? (
                    <Database className="w-5 h-5" />
                  ) : (
                    <CloudOff className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">
                      {supabaseConfigured
                        ? 'Connected to Supabase PostgreSQL Database'
                        : 'Connect Supabase to persist changes'}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        supabaseConfigured
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {supabaseConfigured ? 'Remote Sync Active' : 'Local Storage Mode'}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1 leading-relaxed max-w-3xl">
                    {supabaseConfigured
                      ? 'All modifications are synced in real-time to the "skills" table in Supabase and cached locally in your browser for instant responsiveness.'
                      : 'Note: Changes are currently saved to browser localStorage. Connect your Supabase project credentials in .env (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) to persist skills permanently to cloud database.'}
                  </p>
                </div>
              </div>

              {!supabaseConfigured && (
                <div className="shrink-0 flex items-center">
                  <span className="text-xs font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Auto-saved to localStorage</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-surface-400 mb-1">
              <span className="text-xs font-medium uppercase font-mono">Total Skills</span>
              <Layers className="w-4 h-4 text-primary-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{totalCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-surface-400 mb-1">
              <span className="text-xs font-medium uppercase font-mono">Active Skills</span>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{activeCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-surface-400 mb-1">
              <span className="text-xs font-medium uppercase font-mono">Inactive</span>
              <EyeOff className="w-4 h-4 text-surface-500" />
            </div>
            <p className="text-2xl font-bold text-surface-400 font-mono">{inactiveCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-surface-400 mb-1">
              <span className="text-xs font-medium uppercase font-mono">Categories</span>
              <SlidersHorizontal className="w-4 h-4 text-accent-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{SKILL_CATEGORIES.length}</p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategoryFilter === 'All'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-surface-900 text-surface-400 hover:text-white hover:bg-surface-850 border border-surface-800'
              }`}
            >
              All ({totalCount})
            </button>
            {SKILL_CATEGORIES.map((cat) => {
              const count = skills.filter((s) => s.category === cat).length;
              const isSelected = selectedCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-surface-900 text-surface-400 hover:text-white hover:bg-surface-850 border border-surface-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-primary-700 text-white' : 'bg-surface-800 text-surface-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by skill or category..."
              className="w-full bg-surface-900 border border-surface-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Add Skill Form */}
        {isAddFormOpen && (
          <div className="mt-6 rounded-2xl bg-surface-900/90 border border-primary-500/30 p-5 sm:p-6 shadow-2xl shadow-primary-950/40 animate-slide-down">
            <div className="flex items-center justify-between pb-4 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add New Skill</h3>
                  <p className="text-xs text-surface-400">
                    Define skill name, category, icon emoji, and display order
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFormOpen(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFormError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddSkill} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Skill Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                    Skill Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={addNameInputRef}
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. TypeScript, Docker, Next.js"
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSkillOrder}
                    onChange={(e) => setNewSkillOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Icon Emoji Input with Quick Picker */}
              <div className="pt-2">
                <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                  Icon Emoji <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center text-xl shrink-0">
                    {newSkillIcon || '⚡'}
                  </div>
                  <input
                    type="text"
                    value={newSkillIcon}
                    onChange={(e) => setNewSkillIcon(e.target.value)}
                    placeholder="Type emoji or pick below"
                    maxLength={4}
                    className="w-36 bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white text-center focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                  <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {EMOJI_PALETTE.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setNewSkillIcon(emoji)}
                        className={`h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all shrink-0 ${
                          newSkillIcon === emoji
                            ? 'bg-primary-500/20 border border-primary-500 text-white scale-110'
                            : 'bg-surface-950 hover:bg-surface-800 border border-surface-800 text-surface-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Toggle & Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newSkillActive}
                    onClick={() => setNewSkillActive(!newSkillActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      newSkillActive ? 'bg-emerald-500' : 'bg-surface-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        newSkillActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-mono text-surface-300">
                    {newSkillActive ? 'Active (Visible publicly)' : 'Inactive (Hidden)'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-surface-400 hover:text-white hover:bg-surface-800 border border-transparent transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-medium bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Skill</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Categorized Skills Section */}
        <div className="mt-8 space-y-8">
          {SKILL_CATEGORIES.map((category) => {
            // If filtering by specific category, ignore others
            if (selectedCategoryFilter !== 'All' && selectedCategoryFilter !== category) {
              return null;
            }

            const categorySkills = groupedSkills[category] || [];
            const meta = CATEGORY_META[category];

            return (
              <div
                key={category}
                className="rounded-2xl bg-surface-900/40 border border-surface-800/80 overflow-hidden backdrop-blur-sm"
              >
                {/* Category Header */}
                <div
                  className={`px-5 py-4 border-b border-surface-800/80 bg-gradient-to-r ${meta.bgClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 rounded-xl bg-surface-950/60 border border-surface-800 shadow-sm">
                      {meta.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-white tracking-tight">
                          {category}
                        </h2>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${meta.badgeClass}`}
                        >
                          {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                        </span>
                      </div>
                      <p className="text-xs text-surface-400 mt-0.5">
                        Drag items to reorder, or use the up/down arrows
                      </p>
                    </div>
                  </div>

                  {/* Add skill shortcut for this category */}
                  <button
                    onClick={() => {
                      setNewSkillCategory(category);
                      setIsAddFormOpen(true);
                      setTimeout(() => addNameInputRef.current?.focus(), 100);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-surface-300 hover:text-white bg-surface-950/60 hover:bg-surface-850 border border-surface-800 hover:border-surface-700 transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {category}</span>
                  </button>
                </div>

                {/* Skills List within Category */}
                <div className="p-4 sm:p-5">
                  {categorySkills.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-surface-800/60 rounded-xl">
                      <p className="text-surface-500 text-xs font-mono">
                        No skills in {category} yet.
                      </p>
                      <button
                        onClick={() => {
                          setNewSkillCategory(category);
                          setIsAddFormOpen(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-mono"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add the first skill</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {categorySkills.map((skill, index) => {
                        const isFirst = index === 0;
                        const isLast = index === categorySkills.length - 1;
                        const isDragged = draggedSkillId === skill.id;
                        const isDragOver = dragOverSkillId === skill.id;

                        return (
                          <div
                            key={skill.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, skill.id)}
                            onDragOver={(e) => handleDragOver(e, skill.id)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, skill.id)}
                            className={`group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-150 ${
                              isDragged
                                ? 'opacity-40 border-dashed border-primary-500 bg-surface-950'
                                : isDragOver
                                ? 'border-primary-500 bg-primary-950/20 scale-[1.01]'
                                : skill.active
                                ? 'bg-surface-950/80 hover:bg-surface-900 border-surface-800/90 hover:border-surface-700'
                                : 'bg-surface-950/40 hover:bg-surface-950/70 border-surface-900 text-surface-500'
                            }`}
                          >
                            {/* Left Group: Drag Handle, Emoji, Name, Order */}
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Drag Handle */}
                              <div
                                className="cursor-grab active:cursor-grabbing text-surface-600 hover:text-surface-300 transition-colors p-1"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Icon Emoji Box */}
                              <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                                  skill.active
                                    ? 'bg-surface-900 border-surface-800 shadow-inner'
                                    : 'bg-surface-900/50 border-surface-850 opacity-60'
                                }`}
                              >
                                <span>{skill.icon}</span>
                              </div>

                              {/* Skill Info */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`text-sm font-semibold truncate ${
                                      skill.active ? 'text-white' : 'text-surface-400 line-through'
                                    }`}
                                  >
                                    {skill.name}
                                  </h3>
                                  <span className="text-[10px] font-mono text-surface-500 px-1.5 py-0.5 rounded bg-surface-900 border border-surface-800">
                                    #{skill.display_order}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                                      skill.active ? 'text-emerald-400' : 'text-surface-500'
                                    }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        skill.active
                                          ? 'bg-emerald-400 animate-pulse'
                                          : 'bg-surface-600'
                                      }`}
                                    />
                                    <span>{skill.active ? 'Active' : 'Inactive'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Group: Action Controls */}
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                              {/* Reorder Up Button */}
                              <button
                                onClick={() => handleMoveOrder(skill.id, 'up')}
                                disabled={isFirst}
                                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-850 border border-transparent hover:border-surface-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                                title="Move up in display order"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Reorder Down Button */}
                              <button
                                onClick={() => handleMoveOrder(skill.id, 'down')}
                                disabled={isLast}
                                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-850 border border-transparent hover:border-surface-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                                title="Move down in display order"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active / Inactive Button */}
                              <button
                                onClick={() => handleToggleActive(skill.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                                  skill.active
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-surface-900 hover:bg-surface-800 text-surface-500 border-surface-800'
                                }`}
                                title={skill.active ? 'Click to deactivate' : 'Click to activate'}
                              >
                                <span className="hidden sm:inline">
                                  {skill.active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="sm:hidden">
                                  {skill.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </span>
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => setEditingSkill({ ...skill })}
                                className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 border border-transparent hover:border-primary-500/30 transition-all"
                                title="Edit skill details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setSkillToDelete(skill)}
                                className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                                title="Delete skill"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-900 border border-surface-700/80 shadow-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800 bg-surface-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Edit Skill</h3>
                  <p className="text-xs text-surface-400">Modify properties for {editingSkill.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSkill(null)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editFormError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editFormError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                  Skill Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editingSkill.name}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, name: e.target.value })
                  }
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editingSkill.category}
                    onChange={(e) =>
                      setEditingSkill({
                        ...editingSkill,
                        category: e.target.value as SkillCategory,
                      })
                    }
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingSkill.display_order}
                    onChange={(e) =>
                      setEditingSkill({
                        ...editingSkill,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Icon Emoji Editor */}
              <div>
                <label className="block text-xs font-mono font-medium text-surface-300 uppercase tracking-wider mb-1.5">
                  Icon Emoji
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center text-xl shrink-0">
                    {editingSkill.icon || '⚡'}
                  </div>
                  <input
                    type="text"
                    value={editingSkill.icon}
                    onChange={(e) =>
                      setEditingSkill({ ...editingSkill, icon: e.target.value })
                    }
                    maxLength={4}
                    className="w-32 bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-sm text-white text-center focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                  <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {EMOJI_PALETTE.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setEditingSkill({ ...editingSkill, icon: emoji })}
                        className={`h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all shrink-0 ${
                          editingSkill.icon === emoji
                            ? 'bg-primary-500/20 border border-primary-500 text-white scale-110'
                            : 'bg-surface-950 hover:bg-surface-800 border border-surface-800 text-surface-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingSkill.active}
                    onClick={() =>
                      setEditingSkill({
                        ...editingSkill,
                        active: !editingSkill.active,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      editingSkill.active ? 'bg-emerald-500' : 'bg-surface-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        editingSkill.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-mono text-surface-300">
                    {editingSkill.active ? 'Skill is Active (Visible on public portfolio)' : 'Skill is Inactive (Hidden)'}
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-medium bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {skillToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-900 border border-red-500/30 shadow-2xl p-6 text-center animate-slide-up">
            <div className="h-12 w-12 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold text-white">Delete Skill</h3>
            <p className="text-xs text-surface-400 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-medium">"{skillToDelete.name}"</span> from <span className="text-surface-300">{skillToDelete.category}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSkillToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-surface-400 hover:text-white hover:bg-surface-800 border border-surface-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSkill}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-medium bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Skill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

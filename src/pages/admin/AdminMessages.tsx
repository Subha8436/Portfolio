import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ContactMessage } from '@/types';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  Mail,
  MailOpen,
  Inbox,
  Trash2,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  Database,
  Clock,
  User,
  Copy,
  Check,
  Search,
  X,
  Reply,
  ArrowLeft,
  Info,
  LogOut,
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Wrench,
  Briefcase,
  Compass,
  UserCircle
} from 'lucide-react';

type TabType = 'all' | 'unread' | 'read' | 'archived';

const STORAGE_KEY = 'subhasish_portfolio_contact_messages';

export default function AdminMessages() {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [showSqlHelp, setShowSqlHelp] = useState<boolean>(false);
  const [isCreatingTest, setIsCreatingTest] = useState<boolean>(false);

  const supabaseConnected = isSupabaseConfigured();

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Fetch messages from Supabase or localStorage fallback
  const fetchMessages = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      if (supabaseConnected) {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error, checking local fallback:', error.message);
          // Fall back to local storage if table does not exist yet or query fails
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            try {
              setMessages(JSON.parse(localData));
            } catch {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        } else if (data) {
          setMessages(data as ContactMessage[]);
        }
      } else {
        // Supabase not configured: load from localStorage
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          try {
            setMessages(JSON.parse(localData));
          } catch {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        try {
          setMessages(JSON.parse(localData));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [supabaseConnected]);

  // Initial fetch and Supabase Realtime Subscription
  useEffect(() => {
    fetchMessages();

    if (supabaseConnected) {
      const channel = supabase
        .channel('contact_messages_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'contact_messages' },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchMessages, supabaseConnected]);

  // Sync to localStorage when messages change in offline/demo mode
  const persistLocally = (updated: ContactMessage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Status update handler (unread <-> read, archive <-> unarchive)
  const handleUpdateStatus = async (id: string, newStatus: 'unread' | 'read' | 'archived') => {
    const previous = [...messages];
    const updated = messages.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
    setMessages(updated);

    if (modalMessage && modalMessage.id === id) {
      setModalMessage({ ...modalMessage, status: newStatus });
    }

    if (supabaseConnected) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Failed to update status in Supabase:', error.message);
        showToast('Could not update on Supabase. Updated locally.');
        persistLocally(updated);
      } else {
        const label = newStatus === 'unread' ? 'marked as unread' : newStatus === 'read' ? 'marked as read' : 'archived';
        showToast(`Message ${label}`);
      }
    } else {
      persistLocally(updated);
      const label = newStatus === 'unread' ? 'marked as unread' : newStatus === 'read' ? 'marked as read' : 'archived';
      showToast(`Message ${label}`);
    }
  };

  // Delete message handler
  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    const id = messageToDelete.id;
    const name = messageToDelete.name;
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);

    if (selectedMessageId === id) setSelectedMessageId(null);
    if (modalMessage?.id === id) setModalMessage(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setMessageToDelete(null);

    if (supabaseConnected) {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete message in Supabase:', error.message);
        showToast('Could not delete from Supabase. Deleted locally.');
        persistLocally(updated);
      } else {
        showToast(`Message from ${name} deleted`);
      }
    } else {
      persistLocally(updated);
      showToast(`Message from ${name} deleted`);
    }
  };

  // Batch actions
  const handleBatchMarkAsRead = async () => {
    if (selectedIds.size === 0) return;
    const updated = messages.map((m) =>
      selectedIds.has(m.id) ? { ...m, status: 'read' as const } : m
    );
    setMessages(updated);

    if (supabaseConnected) {
      const idsArray = Array.from(selectedIds);
      await supabase.from('contact_messages').update({ status: 'read' }).in('id', idsArray);
    }
    persistLocally(updated);
    showToast(`${selectedIds.size} message${selectedIds.size > 1 ? 's' : ''} marked as read`);
    setSelectedIds(new Set());
  };

  const handleBatchArchive = async () => {
    if (selectedIds.size === 0) return;
    const updated = messages.map((m) =>
      selectedIds.has(m.id) ? { ...m, status: 'archived' as const } : m
    );
    setMessages(updated);

    if (supabaseConnected) {
      const idsArray = Array.from(selectedIds);
      await supabase.from('contact_messages').update({ status: 'archived' }).in('id', idsArray);
    }
    persistLocally(updated);
    showToast(`${selectedIds.size} message${selectedIds.size > 1 ? 's' : ''} archived`);
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const updated = messages.filter((m) => !selectedIds.has(m.id));
    setMessages(updated);

    if (supabaseConnected) {
      const idsArray = Array.from(selectedIds);
      await supabase.from('contact_messages').delete().in('id', idsArray);
    }
    persistLocally(updated);
    showToast(`${count} message${count > 1 ? 's' : ''} deleted`);
    setSelectedIds(new Set());
  };

  // Expand / view message
  const handleOpenMessage = (msg: ContactMessage) => {
    setModalMessage(msg);
    // Mark as read automatically when opening if unread
    if (msg.status === 'unread') {
      handleUpdateStatus(msg.id, 'read');
    }
  };

  const toggleRowExpand = (e: React.MouseEvent, msg: ContactMessage) => {
    e.stopPropagation();
    if (selectedMessageId === msg.id) {
      setSelectedMessageId(null);
    } else {
      setSelectedMessageId(msg.id);
      if (msg.status === 'unread') {
        handleUpdateStatus(msg.id, 'read');
      }
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    showToast(`Copied ${email} to clipboard`);
  };

  // Create test message for testing contact form ingestion
  const handleCreateTestMessage = async () => {
    setIsCreatingTest(true);
    const sampleNames = ['Alex Rivera', 'Priya Sharma', 'David Chen', 'Sarah Jenkins', 'Elena Rostova'];
    const sampleSubjects = [
      'Project Inquiry: Full-Stack Web Application',
      'Speaking Opportunity at DevCon 2027',
      'Contract Role: Senior Frontend Architect',
      'Collaboration on Open Source AI tools',
      'Portfolio Feedback & Consultation Request'
    ];
    const sampleBodies = [
      'Hi Subhasish,\n\nI came across your portfolio and was thoroughly impressed by your modern 3D UI work and React architecture. We are currently looking for a lead developer for our next venture.\n\nCould we set up a quick 15-minute call sometime this week?\n\nBest regards,\nAlex',
      'Hello Subhasish,\n\nOur team loved your recent articles on TypeScript best practices. We are organizing a tech conference next month and would be honored if you could deliver a keynote on scalable web applications.\n\nPlease let us know if your schedule allows.\n\nCheers!',
      'Hey Subhasish,\n\nWe have an immediate opening for a contract Senior Frontend Architect to assist with migrating our dashboard to Tailwind and Supabase.\n\nLooking forward to connecting.\nDavid',
      'Hi Subhasish,\n\nYour portfolio looks stunning! Wanted to touch base regarding your experience with three.js and real-time Supabase integrations. We have an upcoming client project that matches your skillset perfectly.\n\nBest,\nElena'
    ];

    const randomIndex = Math.floor(Math.random() * sampleNames.length);
    const randomName = sampleNames[randomIndex];
    const randomSubject = sampleSubjects[randomIndex % sampleSubjects.length];
    const randomBody = sampleBodies[randomIndex % sampleBodies.length];
    const emailName = randomName.toLowerCase().replace(/\s+/g, '.');

    const newMsg: ContactMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`,
      name: randomName,
      email: `${emailName}@example.com`,
      subject: randomSubject,
      message: randomBody,
      status: 'unread',
      created_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([newMsg])
        .select()
        .single();

      if (error) {
        console.warn('Could not insert to Supabase, saving locally:', error.message);
        const updated = [newMsg, ...messages];
        setMessages(updated);
        persistLocally(updated);
      } else if (data) {
        setMessages((prev) => [data as ContactMessage, ...prev]);
      }
    } else {
      const updated = [newMsg, ...messages];
      setMessages(updated);
      persistLocally(updated);
    }

    setIsCreatingTest(false);
    showToast(`Test message from ${randomName} created!`);
  };

  // Counts
  const counts = useMemo(() => {
    const unread = messages.filter((m) => m.status === 'unread').length;
    const read = messages.filter((m) => m.status === 'read').length;
    const archived = messages.filter((m) => m.status === 'archived').length;
    return {
      all: messages.length,
      unread,
      read,
      archived
    };
  }, [messages]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    let result = messages;

    // Filter by tab
    if (activeTab === 'unread') {
      result = result.filter((m) => m.status === 'unread');
    } else if (activeTab === 'read') {
      result = result.filter((m) => m.status === 'read');
    } else if (activeTab === 'archived') {
      result = result.filter((m) => m.status === 'archived');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.subject.toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query)
      );
    }

    return result;
  }, [messages, activeTab, searchQuery]);

  // Checkbox toggle helpers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length && filteredMessages.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  const toggleSelectOne = (e: React.SyntheticEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Format date nicely
  const formatMessageDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Relative if within 24 hours
      if (diffHours < 1) {
        const diffMins = Math.max(1, Math.round(diffMs / (1000 * 60)));
        return `${diffMins}m ago`;
      }
      if (diffHours < 24) {
        return `${Math.round(diffHours)}h ago`;
      }

      // If same year
      const isSameYear = date.getFullYear() === now.getFullYear();
      if (isSameYear) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDetailedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: 'unread' | 'read' | 'archived' }) => {
    if (status === 'unread') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Unread
        </span>
      );
    }
    if (status === 'read') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-800 text-surface-400 border border-surface-700">
          <span className="w-2 h-2 rounded-full bg-surface-500" />
          Read
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-900/80 text-surface-500 border border-surface-800 opacity-75">
        <span className="w-2 h-2 rounded-full bg-surface-600" />
        Archived
      </span>
    );
  };

  // 1. Auth Check: Wait for loading, then verify user is authenticated admin
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left branding & return to site */}
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
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-primary-600/20 border border-primary-500/30 text-primary-300 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-primary-400" />
                Messages
                {counts.unread > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-0.5" />
                )}
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
                className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-900 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                Journey
              </Link>
            </nav>

            {/* Right side user info & Logout */}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supabase Connection Status Card / Banner */}
        <div className="mb-6">
          {supabaseConnected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-900/60 border border-emerald-500/30 text-surface-300 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-emerald-400 mr-2">Supabase Connected:</span>
                  <span className="text-surface-300">
                    Live synchronization active with the <code className="px-1.5 py-0.5 bg-surface-800 rounded text-emerald-300 text-[11px] font-mono">contact_messages</code> table.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => fetchMessages(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-primary-400' : ''}`} />
                  Sync Now
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-surface-300 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 text-sm mb-1 flex items-center gap-2">
                      <span>Supabase Configuration Notice</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        Local Fallback Mode
                      </span>
                    </div>
                    <p className="text-surface-300 leading-relaxed max-w-3xl">
                      Supabase environment variables (<code className="px-1 py-0.5 bg-surface-900 rounded font-mono text-amber-200">VITE_SUPABASE_URL</code> &amp; <code className="px-1 py-0.5 bg-surface-900 rounded font-mono text-amber-200">VITE_SUPABASE_ANON_KEY</code>) are not yet configured. All messages and status updates are persisted in your browser's <strong className="text-white">localStorage</strong> for instant offline preview and testing.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSqlHelp(!showSqlHelp)}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 shrink-0 transition-colors"
                >
                  {showSqlHelp ? 'Hide SQL Schema' : 'View SQL Schema'}
                </button>
              </div>

              {showSqlHelp && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 animate-in">
                  <div className="text-[11px] text-surface-400 mb-1 font-medium">
                    Run this SQL snippet in your Supabase SQL Editor to initialize the contact table:
                  </div>
                  <pre className="p-3 bg-surface-950/90 rounded-lg border border-surface-800 text-[11px] font-mono text-emerald-400 overflow-x-auto selection:bg-primary-500/30">
{`-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous visitors to submit contact forms
CREATE POLICY "Allow public inserts to contact_messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Allow authenticated admins to view, update, and delete messages
CREATE POLICY "Allow authenticated admins full access"
  ON public.contact_messages FOR ALL
  USING (auth.role() = 'authenticated');`}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Heading & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Contact Messages
              </h1>
              {counts.unread > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  {counts.unread} unread
                </span>
              )}
            </div>
            <p className="text-sm text-surface-400 mt-1">
              Read, organize, and reply to client inquiries sent through your portfolio contact form.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => fetchMessages(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 hover:border-surface-600 text-surface-200 text-xs font-medium hover:bg-surface-850 transition-all shadow-sm"
              title="Refresh messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleCreateTestMessage}
              disabled={isCreatingTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium shadow-md shadow-primary-600/25 transition-all"
              title="Simulate receiving a message from the portfolio contact form"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isCreatingTest ? 'Sending...' : 'Create Test Message'}</span>
            </button>
          </div>
        </div>

        {/* Tabs & Search Filter Header */}
        <div className="bg-surface-900/60 border border-surface-800 rounded-xl p-3 sm:p-4 mb-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                    activeTab === 'all'
                      ? 'bg-primary-700 text-primary-100'
                      : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('unread')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'unread'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Unread</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                    activeTab === 'unread'
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.unread}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('read')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'read'
                    ? 'bg-surface-700 text-white shadow-sm'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }`}
              >
                <span>Read</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                    activeTab === 'read'
                      ? 'bg-surface-800 text-surface-300'
                      : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.read}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('archived')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'archived'
                    ? 'bg-surface-700 text-white shadow-sm'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-surface-400" />
                <span>Archived</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                    activeTab === 'archived'
                      ? 'bg-surface-800 text-surface-300'
                      : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {counts.archived}
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sender, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-surface-950 border border-surface-700 text-surface-100 placeholder-surface-500 text-xs focus:outline-none focus:border-primary-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bulk Selection Actions Bar */}
          {filteredMessages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none text-surface-400 hover:text-surface-300">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-primary-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Select All ({filteredMessages.length})</span>
                </label>

                {selectedIds.size > 0 && (
                  <span className="text-surface-400 border-l border-surface-700 pl-3">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 animate-in">
                  <button
                    onClick={handleBatchMarkAsRead}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs transition-colors"
                  >
                    <MailOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mark as Read</span>
                  </button>
                  <button
                    onClick={handleBatchArchive}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-2 py-1 text-surface-400 hover:text-surface-200 text-xs"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-surface-800 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm text-surface-400">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          /* Empty State */
          <div className="py-20 px-4 text-center rounded-2xl bg-surface-900/40 border border-surface-800/80 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-sm text-surface-400 max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery
                ? `No messages match your search "${searchQuery}". Try a different keyword.`
                : activeTab === 'unread'
                ? "You're all caught up! No unread messages in your inbox."
                : activeTab === 'read'
                ? 'No messages marked as read.'
                : activeTab === 'archived'
                ? 'No messages in your archive.'
                : 'Inquiries submitted by visitors via your portfolio contact form will appear here in real time.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-white text-xs font-medium transition-colors"
                >
                  Clear Search Filter
                </button>
              ) : (
                <button
                  onClick={handleCreateTestMessage}
                  disabled={isCreatingTest}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium shadow-md shadow-primary-600/25 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Test Message</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop View: Modern Table / Row Layout */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-surface-800 bg-surface-900/50 backdrop-blur-sm shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-900/80 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-primary-600 focus:ring-0 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="py-3 px-3 w-16 text-center">Status</th>
                    <th className="py-3 px-4 w-52">Sender</th>
                    <th className="py-3 px-4">Subject &amp; Message Preview</th>
                    <th className="py-3 px-4 w-32 text-right">Date</th>
                    <th className="py-3 px-4 w-36 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60 text-xs">
                  {filteredMessages.map((msg) => {
                    const isUnread = msg.status === 'unread';
                    const isArchived = msg.status === 'archived';
                    const isExpanded = selectedMessageId === msg.id;
                    const isSelected = selectedIds.has(msg.id);

                    return (
                      <Fragment key={msg.id}>
                        <tr
                          onClick={() => handleOpenMessage(msg)}
                          className={`group cursor-pointer transition-colors ${
                            isUnread
                              ? 'bg-surface-900/90 font-medium text-white hover:bg-surface-850'
                              : isArchived
                              ? 'bg-surface-950/40 text-surface-400 hover:bg-surface-900/50 opacity-80'
                              : 'text-surface-300 hover:bg-surface-900/70'
                          } ${isSelected ? 'bg-primary-950/30' : ''}`}
                        >
                          {/* Checkbox */}
                          <td
                            className="py-3 px-4 text-center"
                            onClick={(e) => toggleSelectOne(e, msg.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-primary-600 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 text-center">
                            <StatusBadge status={msg.status} />
                          </td>

                          {/* Sender info */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className={`truncate max-w-[190px] ${isUnread ? 'text-white font-semibold' : 'text-surface-200'}`}>
                                {msg.name}
                              </span>
                              <span className="text-[11px] text-surface-400 truncate max-w-[190px]">
                                {msg.email}
                              </span>
                            </div>
                          </td>

                          {/* Subject & Preview snippet */}
                          <td className="py-3 px-4">
                            <div className="flex items-baseline gap-2 max-w-xl">
                              <span className={`truncate shrink-0 ${isUnread ? 'text-white font-semibold' : 'text-surface-200'}`}>
                                {msg.subject}
                              </span>
                              <span className="text-surface-500 select-none">-</span>
                              <span className="text-surface-400 text-xs truncate max-w-md">
                                {msg.message.replace(/\s+/g, ' ')}
                              </span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-right whitespace-nowrap text-surface-400 font-mono text-[11px]">
                            {formatMessageDate(msg.created_at)}
                          </td>

                          {/* Actions */}
                          <td
                            className="py-3 px-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              {/* Toggle Inline Expand */}
                              <button
                                onClick={(e) => toggleRowExpand(e, msg)}
                                className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
                                title={isExpanded ? 'Collapse preview' : 'Expand preview inline'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-primary-400" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              {/* Toggle Read/Unread */}
                              <button
                                onClick={() => handleUpdateStatus(msg.id, isUnread ? 'read' : 'unread')}
                                className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
                                title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                              >
                                {isUnread ? <MailOpen className="w-4 h-4 text-blue-400" /> : <Mail className="w-4 h-4" />}
                              </button>

                              {/* Toggle Archive */}
                              <button
                                onClick={() => handleUpdateStatus(msg.id, isArchived ? 'read' : 'archived')}
                                className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-amber-400 transition-colors"
                                title={isArchived ? 'Move back to Inbox' : 'Archive message'}
                              >
                                {isArchived ? <ArchiveRestore className="w-4 h-4 text-amber-400" /> : <Archive className="w-4 h-4" />}
                              </button>

                              {/* Delete message */}
                              <button
                                onClick={() => setMessageToDelete(msg)}
                                className="p-1.5 rounded-md hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors"
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr
                            key={`${msg.id}-expanded`}
                            className="bg-surface-950/70 border-b border-surface-800 animate-in"
                          >
                            <td colSpan={6} className="px-6 py-4">
                              <div className="flex flex-col gap-2.5 max-w-4xl pl-8 border-l-2 border-primary-500/50">
                                <div className="flex items-center justify-between text-xs text-surface-400">
                                  <span className="font-medium text-surface-300">
                                    Message from {msg.name} ({msg.email})
                                  </span>
                                  <button
                                    onClick={() => handleOpenMessage(msg)}
                                    className="text-primary-400 hover:text-primary-300 font-medium underline flex items-center gap-1"
                                  >
                                    Open in full reader &rarr;
                                  </button>
                                </div>
                                <div className="text-surface-200 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-surface-900/60 p-3 rounded-lg border border-surface-800">
                                  {msg.message}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards Layout */}
            <div className="block sm:hidden space-y-3">
              {filteredMessages.map((msg) => {
                const isUnread = msg.status === 'unread';
                const isArchived = msg.status === 'archived';
                const isSelected = selectedIds.has(msg.id);
                const isExpanded = selectedMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isUnread
                        ? 'bg-surface-900 border-primary-500/40 shadow-sm'
                        : isArchived
                        ? 'bg-surface-950 border-surface-800/60 opacity-80'
                        : 'bg-surface-900/60 border-surface-800'
                    } ${isSelected ? 'ring-1 ring-primary-500' : ''}`}
                  >
                    {/* Card Top: Selection Checkbox, Status & Date */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectOne(e, msg.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-surface-700 bg-surface-950 text-primary-600 focus:ring-0 cursor-pointer"
                        />
                        <StatusBadge status={msg.status} />
                      </div>
                      <span className="text-[11px] text-surface-400 font-mono">
                        {formatMessageDate(msg.created_at)}
                      </span>
                    </div>

                    {/* Sender & Subject */}
                    <div className="mb-2">
                      <div className="text-sm font-semibold text-white">{msg.name}</div>
                      <div className="text-xs text-primary-400 truncate">{msg.email}</div>
                      <div className="text-xs font-medium text-surface-200 mt-1">{msg.subject}</div>
                    </div>

                    {/* Preview / Snippet or Expanded Message */}
                    {isExpanded ? (
                      <div className="mb-3 p-3 rounded-lg bg-surface-950 border border-surface-800 text-xs text-surface-200 whitespace-pre-wrap leading-relaxed animate-in">
                        {msg.message}
                      </div>
                    ) : (
                      <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed mb-3">
                        {msg.message}
                      </p>
                    )}

                    {/* Mobile Card Action Bar */}
                    <div
                      className="pt-2 border-t border-surface-800/80 flex items-center justify-between text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenMessage(msg)}
                        className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
                      >
                        View Full Message &rarr;
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleRowExpand(e, msg)}
                          className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-white"
                          title={isExpanded ? 'Collapse' : 'Expand preview'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-primary-400" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, isUnread ? 'read' : 'unread')}
                          className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-white"
                          title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                        >
                          {isUnread ? <MailOpen className="w-4 h-4 text-blue-400" /> : <Mail className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, isArchived ? 'read' : 'archived')}
                          className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-amber-400"
                          title={isArchived ? 'Move to Inbox' : 'Archive'}
                        >
                          {isArchived ? <ArchiveRestore className="w-4 h-4 text-amber-400" /> : <Archive className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setMessageToDelete(msg)}
                          className="p-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* View Full Message Modal / Drawer */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in">
          <div
            className="w-full max-w-2xl bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between bg-surface-950/60">
              <div className="flex items-center gap-3">
                <StatusBadge status={modalMessage.status} />
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDetailedDate(modalMessage.created_at)}
                </span>
              </div>
              <button
                onClick={() => setModalMessage(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-4">
              {/* Subject */}
              <h2 className="text-xl font-bold text-white tracking-tight">
                {modalMessage.subject}
              </h2>

              {/* Sender Details Box */}
              <div className="p-3.5 rounded-xl bg-surface-950/70 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {modalMessage.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{modalMessage.name}</div>
                    <div className="text-xs text-surface-400">{modalMessage.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyEmail(modalMessage.email)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs transition-colors"
                    title="Copy sender email address"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                  </button>

                  <a
                    href={`mailto:${modalMessage.email}?subject=Re: ${encodeURIComponent(modalMessage.subject)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </a>
                </div>
              </div>

              {/* Full Message Body */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Message Content
                </div>
                <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 text-surface-200 text-sm leading-relaxed whitespace-pre-wrap select-text font-sans">
                  {modalMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer Quick Actions */}
            <div className="px-6 py-4 border-t border-surface-800 bg-surface-950/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      modalMessage.id,
                      modalMessage.status === 'unread' ? 'read' : 'unread'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs transition-colors"
                >
                  {modalMessage.status === 'unread' ? (
                    <>
                      <MailOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Mark as Read</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Mark as Unread</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      modalMessage.id,
                      modalMessage.status === 'archived' ? 'read' : 'archived'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs transition-colors"
                >
                  {modalMessage.status === 'archived' ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                      <span>Move to Inbox</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>Archive</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMessageToDelete(modalMessage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setModalMessage(null)}
                  className="px-4 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-white text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in">
          <div
            className="w-full max-w-md bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Delete Contact Message?</h3>
            <p className="text-xs text-surface-300 leading-relaxed mb-4">
              Are you sure you want to permanently delete this message from{' '}
              <strong className="text-white">{messageToDelete.name}</strong> (
              <span className="text-surface-400">{messageToDelete.email}</span>)? This action cannot be undone.
            </p>

            <div className="p-3 bg-surface-950 rounded-lg border border-surface-800 text-xs text-surface-400 mb-6 truncate">
              <span className="font-semibold text-surface-300">Subject: </span>
              {messageToDelete.subject}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-md shadow-red-600/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-900 border border-primary-500/40 text-surface-100 text-xs shadow-2xl shadow-black/80 animate-in">
          <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-surface-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

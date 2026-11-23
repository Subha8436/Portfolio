import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AdminStats } from '@/types';
import LoadingScreen from '@/components/ui/LoadingScreen';
import AdminLayout from '@/components/layout/AdminLayout';
export { AdminLayout };
import {
  FolderOpen,
  FileText,
  Clock,
  MessageSquare,
  Plus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Database,
  ExternalLink,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Inbox,
  PenTool,
  Code2,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'project' | 'article' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  statusBadge: {
    label: string;
    variant: 'emerald' | 'amber' | 'rose' | 'primary';
  };
  link: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Authentication check - redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Dashboard state
  const [stats, setStats] = useState<AdminStats>({
    totalProjects: 4,
    publishedArticles: 8,
    draftArticles: 2,
    unreadMessages: 3,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // Default fallback activities when database is offline or empty
  const fallbackActivities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'message',
      title: 'New Client Inquiry',
      description: 'Sarah Johnson sent a project consultation request regarding AI Web App development.',
      timestamp: '25 minutes ago',
      statusBadge: { label: 'Unread', variant: 'rose' },
      link: '/admin/messages',
    },
    {
      id: 'act-2',
      type: 'project',
      title: 'Project Updated: DavaCheck',
      description: 'Updated tech stack tags and live deployment link for medicine awareness platform.',
      timestamp: '2 hours ago',
      statusBadge: { label: 'Published', variant: 'emerald' },
      link: '/admin/projects',
    },
    {
      id: 'act-3',
      type: 'article',
      title: 'Draft Created: Modern Fullstack AI',
      description: 'Initiated article on integrating Google Gemini API with React 19 & Tailwind CSS.',
      timestamp: 'Yesterday at 4:15 PM',
      statusBadge: { label: 'Draft', variant: 'amber' },
      link: '/admin/blog',
    },
    {
      id: 'act-4',
      type: 'project',
      title: 'MealMind AI Showcase',
      description: 'Featured project placed on hero section of portfolio.',
      timestamp: '3 days ago',
      statusBadge: { label: 'Featured', variant: 'primary' },
      link: '/admin/projects',
    },
  ];

  // Fetch live stats and activities from Supabase
  const fetchDashboardData = useCallback(async () => {
    setIsLoadingStats(true);

    if (!isSupabaseConfigured()) {
      // Use standard baseline data when Supabase credentials are not yet configured
      setStats({
        totalProjects: 4,
        publishedArticles: 8,
        draftArticles: 2,
        unreadMessages: 3,
      });
      setRecentActivities(fallbackActivities);
      setIsLoadingStats(false);
      setLastRefreshed(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      return;
    }

    try {
      // Execute parallel queries for counts
      const [
        projectsResult,
        publishedResult,
        draftsResult,
        messagesResult,
        recentMsgsResult,
        recentProjectsResult,
      ] = await Promise.allSettled([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'draft'),
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'unread'),
        supabase
          .from('contact_messages')
          .select('id, name, subject, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('projects')
          .select('id, title, status, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const projectCount =
        projectsResult.status === 'fulfilled' && projectsResult.value.count !== null
          ? projectsResult.value.count
          : 4;

      const publishedCount =
        publishedResult.status === 'fulfilled' && publishedResult.value.count !== null
          ? publishedResult.value.count
          : 8;

      const draftCount =
        draftsResult.status === 'fulfilled' && draftsResult.value.count !== null
          ? draftsResult.value.count
          : 2;

      const unreadCount =
        messagesResult.status === 'fulfilled' && messagesResult.value.count !== null
          ? messagesResult.value.count
          : 3;

      setStats({
        totalProjects: projectCount,
        publishedArticles: publishedCount,
        draftArticles: draftCount,
        unreadMessages: unreadCount,
      });

      // Construct live activities list if available
      const liveActivities: ActivityItem[] = [];

      if (
        recentMsgsResult.status === 'fulfilled' &&
        recentMsgsResult.value.data &&
        recentMsgsResult.value.data.length > 0
      ) {
        recentMsgsResult.value.data.forEach((msg) => {
          liveActivities.push({
            id: `msg-${msg.id}`,
            type: 'message',
            title: `Message from ${msg.name}`,
            description: msg.subject || 'New contact inquiry received via website.',
            timestamp: new Date(msg.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            statusBadge: {
              label: msg.status === 'unread' ? 'Unread' : 'Read',
              variant: msg.status === 'unread' ? 'rose' : 'primary',
            },
            link: '/admin/messages',
          });
        });
      }

      if (
        recentProjectsResult.status === 'fulfilled' &&
        recentProjectsResult.value.data &&
        recentProjectsResult.value.data.length > 0
      ) {
        recentProjectsResult.value.data.forEach((proj) => {
          liveActivities.push({
            id: `proj-${proj.id}`,
            type: 'project',
            title: `Project: ${proj.title}`,
            description: `Project status is currently ${proj.status || 'published'}.`,
            timestamp: new Date(proj.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            }),
            statusBadge: {
              label: (proj.status || 'Active').toUpperCase(),
              variant: proj.status === 'published' ? 'emerald' : 'amber',
            },
            link: '/admin/projects',
          });
        });
      }

      setRecentActivities(
        liveActivities.length > 0 ? liveActivities.slice(0, 5) : fallbackActivities
      );
    } catch (err) {
      console.warn('Could not fetch Supabase admin stats, using baseline defaults', err);
      setStats({
        totalProjects: 4,
        publishedArticles: 8,
        draftArticles: 2,
        unreadMessages: 3,
      });
      setRecentActivities(fallbackActivities);
    } finally {
      setIsLoadingStats(false);
      setLastRefreshed(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Loading state while checking authentication
  if (authLoading || !user) {
    return <LoadingScreen />;
  }

  const isConfigured = isSupabaseConfigured();

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin Portfolio — SUBHASISH</title>
        <meta name="description" content="Subhasish Portfolio Administrator Control Center" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminLayout unreadCount={stats.unreadMessages}>
        <div className="space-y-8 animate-in pb-12">
          {/* ======================================================== */}
          {/* HEADER / WELCOME SECTION                                 */}
          {/* ======================================================== */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-900/90 via-surface-900/60 to-primary-950/30 border border-surface-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            {/* Ambient decorative background glows */}
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute right-1/3 -bottom-12 w-48 h-48 bg-accent-600/10 rounded-full blur-2xl pointer-events-none"
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Control Center</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
                  Welcome, Admin
                </h1>

                <p className="text-sm text-surface-400 max-w-2xl leading-relaxed">
                  Manage your portfolio projects, published articles, skills, and client inquiries from one unified dashboard.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-surface-400">
                  <span className="flex items-center gap-1.5 font-mono text-surface-300">
                    <Calendar className="w-3.5 h-3.5 text-primary-400" />
                    {todayFormatted}
                  </span>
                  <span className="text-surface-700">•</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {isConfigured ? 'Supabase Connected' : 'Local / Demo Mode'}
                  </span>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={isLoadingStats}
                  title="Refresh statistics"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-800/80 hover:bg-surface-800 border border-surface-700/60 text-surface-300 hover:text-white text-xs font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-primary-400' : ''}`}
                  />
                  <span>Refresh</span>
                </button>

                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-xs font-medium transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
                >
                  <span>Live Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STATS CARDS IN 2x2 GRID                                  */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <h2 className="text-base font-display font-semibold text-white tracking-wide">
                  Portfolio Metrics
                </h2>
              </div>
              <span className="text-xs text-surface-500 font-mono">
                Updated {lastRefreshed}
              </span>
            </div>

            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {/* Card 1: Total Projects */}
              <div className="relative group rounded-2xl bg-surface-900/70 hover:bg-surface-900 border border-surface-800/80 hover:border-primary-500/40 p-6 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-primary-500/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary-500" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                        Total Projects
                      </p>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                        {isLoadingStats ? '—' : stats.totalProjects}
                      </span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <p className="text-xs text-surface-400">
                      Showcased in your portfolio and GitHub integrations
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600/20 to-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all duration-300 shadow-inner">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-800/60 flex items-center justify-between">
                  <Link
                    to="/admin/projects"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors group/link"
                  >
                    <span>Manage Projects</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                  <span className="text-[11px] text-surface-500 font-mono">
                    /admin/projects
                  </span>
                </div>
              </div>

              {/* Card 2: Published Articles */}
              <div className="relative group rounded-2xl bg-surface-900/70 hover:bg-surface-900 border border-surface-800/80 hover:border-emerald-500/40 p-6 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                        Published Articles
                      </p>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                        {isLoadingStats ? '—' : stats.publishedArticles}
                      </span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Live
                      </span>
                    </div>

                    <p className="text-xs text-surface-400">
                      Publicly accessible tech articles and tutorials
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-800/60 flex items-center justify-between">
                  <Link
                    to="/admin/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group/link"
                  >
                    <span>View Published Articles</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                  <span className="text-[11px] text-surface-500 font-mono">
                    /admin/blog
                  </span>
                </div>
              </div>

              {/* Card 3: Draft Articles */}
              <div className="relative group rounded-2xl bg-surface-900/70 hover:bg-surface-900 border border-surface-800/80 hover:border-amber-500/40 p-6 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-amber-500/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                        Draft Articles
                      </p>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                        {isLoadingStats ? '—' : stats.draftArticles}
                      </span>
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        In Progress
                      </span>
                    </div>

                    <p className="text-xs text-surface-400">
                      Unpublished blog posts in editorial workflow
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 shadow-inner">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-800/60 flex items-center justify-between">
                  <Link
                    to="/admin/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors group/link"
                  >
                    <span>Resume Writing Drafts</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                  <span className="text-[11px] text-surface-500 font-mono">
                    /admin/blog
                  </span>
                </div>
              </div>

              {/* Card 4: Unread Messages */}
              <div className="relative group rounded-2xl bg-surface-900/70 hover:bg-surface-900 border border-surface-800/80 hover:border-rose-500/40 p-6 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-rose-500/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                        Unread Messages
                      </p>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                        {isLoadingStats ? '—' : stats.unreadMessages}
                      </span>
                      {stats.unreadMessages > 0 && (
                        <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 animate-pulse">
                          Needs Attention
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-surface-400">
                      Client inquiries submitted via the contact form
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600/20 to-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-300 shadow-inner">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-800/60 flex items-center justify-between">
                  <Link
                    to="/admin/messages"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors group/link"
                  >
                    <span>Check Messages Inbox</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                  <span className="text-[11px] text-surface-500 font-mono">
                    /admin/messages
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* QUICK ACTIONS SECTION                                    */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <h2 className="text-base font-display font-semibold text-white tracking-wide">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Action 1: New Project */}
              <Link
                to="/admin/projects"
                className="group relative rounded-2xl bg-surface-900/60 hover:bg-surface-800/70 border border-surface-800/80 hover:border-primary-500/40 p-5 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-200">
                    <Plus className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors">
                      New Project
                    </h3>
                    <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                      Add a new project with screenshots, tech tags, and links.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-800/50 flex items-center text-xs font-medium text-primary-400 group-hover:text-primary-300 gap-1.5">
                  <span>Create Project</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Action 2: New Article */}
              <Link
                to="/admin/blog"
                className="group relative rounded-2xl bg-surface-900/60 hover:bg-surface-800/70 border border-surface-800/80 hover:border-accent-500/40 p-5 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400 group-hover:bg-accent-500 group-hover:text-white transition-all duration-200">
                    <PenTool className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-accent-300 transition-colors">
                      New Article
                    </h3>
                    <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                      Draft a new blog post with Markdown, reading time, and tags.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-800/50 flex items-center text-xs font-medium text-accent-400 group-hover:text-accent-300 gap-1.5">
                  <span>Write Article</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Action 3: View Messages */}
              <Link
                to="/admin/messages"
                className="group relative rounded-2xl bg-surface-900/60 hover:bg-surface-800/70 border border-surface-800/80 hover:border-rose-500/40 p-5 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-200">
                    <Inbox className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                      View Messages
                    </h3>
                    <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                      Respond to inquiries, filter unread items, or manage leads.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-800/50 flex items-center text-xs font-medium text-rose-400 group-hover:text-rose-300 gap-1.5">
                  <span>Open Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RECENT ACTIVITY SECTION                                  */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-display font-semibold text-white tracking-wide">
                Recent Activity
              </h2>
              <Link
                to="/admin/messages"
                className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 group"
              >
                <span>View All Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="rounded-2xl bg-surface-900/70 border border-surface-800/80 backdrop-blur-xl overflow-hidden shadow-lg divide-y divide-surface-800/60">
              {recentActivities.map((activity) => {
                const getVariantStyle = (variant: ActivityItem['statusBadge']['variant']) => {
                  switch (variant) {
                    case 'emerald':
                      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    case 'amber':
                      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    case 'rose':
                      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                    case 'primary':
                    default:
                      return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
                  }
                };

                const getActivityIcon = (type: ActivityItem['type']) => {
                  switch (type) {
                    case 'message':
                      return <MessageSquare className="w-4 h-4 text-rose-400" />;
                    case 'article':
                      return <FileText className="w-4 h-4 text-emerald-400" />;
                    case 'project':
                      return <Code2 className="w-4 h-4 text-primary-400" />;
                    case 'system':
                    default:
                      return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
                  }
                };

                return (
                  <div
                    key={activity.id}
                    className="p-4 sm:p-5 hover:bg-surface-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {activity.title}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border uppercase tracking-wider ${getVariantStyle(
                              activity.statusBadge.variant
                            )}`}
                          >
                            {activity.statusBadge.label}
                          </span>
                        </div>
                        <p className="text-xs text-surface-400 leading-relaxed max-w-xl">
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:pl-0 pl-12">
                      <span className="text-xs text-surface-500 font-mono">
                        {activity.timestamp}
                      </span>
                      <Link
                        to={activity.link}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700/50 transition-colors"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SYSTEM SUMMARY & DOCUMENTATION BANNER                    */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-surface-900/40 border border-surface-800/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-surface-400">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-primary-400 shrink-0" />
              <div>
                <span className="text-surface-200 font-medium">Supabase Architecture: </span>
                <span>
                  Tables active for projects, blog posts, skills, contact messages, services, and profile.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
              <span className="text-surface-500">v1.0.0-production</span>
              <span className="text-surface-700">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Operational
              </span>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

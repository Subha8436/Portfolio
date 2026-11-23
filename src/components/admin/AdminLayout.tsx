import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Code2,
  Wrench,
  Mail,
  User,
  Milestone,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Database,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavItem {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'admin.dashboard', fallbackLabel: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { id: 'projects', labelKey: 'admin.projects', fallbackLabel: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { id: 'blog', labelKey: 'admin.blog', fallbackLabel: 'Blog Posts', path: '/admin/blog', icon: FileText },
  { id: 'skills', labelKey: 'admin.skills', fallbackLabel: 'Skills', path: '/admin/skills', icon: Code2 },
  { id: 'services', labelKey: 'admin.services', fallbackLabel: 'Services', path: '/admin/services', icon: Wrench },
  { id: 'messages', labelKey: 'admin.messages', fallbackLabel: 'Messages', path: '/admin/messages', icon: Mail },
  { id: 'profile', labelKey: 'admin.profile', fallbackLabel: 'Profile', path: '/admin/profile', icon: User },
  { id: 'journey', labelKey: 'admin.journey', fallbackLabel: 'Journey', path: '/admin/journey', icon: Milestone },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { t, i18n } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isSupabaseReady = isSupabaseConfigured();
  const isBengali = i18n.language ? i18n.language.startsWith('bn') : false;

  // Protect admin route: redirect to /admin/login if supabase is configured and user is unauthenticated
  useEffect(() => {
    if (!loading && isSupabaseReady && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, isSupabaseReady, navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const nextLang = isBengali ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
    document.documentElement.lang = nextLang;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-surface-200">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-sm font-mono text-surface-400 tracking-wider">
          {t('common.loading', 'Loading Admin Console...')}
        </p>
      </div>
    );
  }

  const renderNavLinks = () => (
    <nav className="space-y-1 px-3 py-4" aria-label="Admin Navigation">
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-surface-500">
        Management
      </div>
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
        const label = t(item.labelKey, item.fallbackLabel);

        return (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/10 text-primary-300 border border-primary-500/30 shadow-sm shadow-primary-500/10'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900/80 border border-transparent'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'
                )}
              />
              <span>{label}</span>
            </div>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 flex flex-col lg:flex-row antialiased selection:bg-primary-500/30 selection:text-white">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-surface-950 border-r border-surface-800/80 z-30">
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-surface-800/80 bg-surface-950/50 backdrop-blur-md">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-wide bg-gradient-to-r from-white via-surface-200 to-surface-400 bg-clip-text text-transparent">
                SUBHASISH
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono uppercase font-semibold rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-2">
          {renderNavLinks()}
        </div>

        {/* Database status & Quick Actions */}
        <div className="p-4 border-t border-surface-800/80 bg-surface-900/40 space-y-3">
          {/* Supabase Status Pill */}
          <div className="p-2.5 rounded-xl bg-surface-900/80 border border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className={cn('w-4 h-4', isSupabaseReady ? 'text-emerald-400' : 'text-amber-400')} />
              <div className="text-xs">
                <p className="font-medium text-surface-300">
                  {isSupabaseReady ? 'Supabase Live' : 'Demo Mode'}
                </p>
                <p className="text-[10px] text-surface-500">
                  {isSupabaseReady ? 'Full CRUD Active' : 'Local Mock Storage'}
                </p>
              </div>
            </div>
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isSupabaseReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              )}
            />
          </div>

          {/* User profile / Demo session info */}
          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-surface-200 truncate">
                {user?.email || 'Subhasish Admin'}
              </p>
              <p className="text-[10px] text-surface-500 truncate">
                {user ? 'Authenticated Admin' : 'Demo Administrator'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title={t('admin.logout', 'Logout')}
              className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* View live portfolio */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium bg-surface-800/60 hover:bg-surface-800 text-surface-300 hover:text-white transition-colors border border-surface-700/50"
          >
            <span>View Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* ================= MOBILE HEADER & DRAWER ================= */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface-950/95 backdrop-blur-md border-b border-surface-800/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-900 border border-surface-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-md">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-wide text-white">
              ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-900 border border-surface-800 text-surface-300 hover:text-white"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 inline mr-1 text-primary-400" />
            <span>{isBengali ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-surface-900 border border-surface-800 text-surface-300 hover:text-white"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-primary-400" />
            )}
          </button>

          {/* View Site */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-surface-900 border border-surface-800 text-surface-300 hover:text-white"
            title="View Portfolio"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-surface-950 border-r border-surface-800 flex flex-col justify-between shadow-2xl"
            >
              <div className="p-4 border-b border-surface-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-base text-white">
                    Subhasish Admin
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-2 text-surface-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {renderNavLinks()}
              </div>

              <div className="p-4 border-t border-surface-800 space-y-3 bg-surface-900/60">
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold border border-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('admin.logout', 'Sign Out')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Desktop App Bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-surface-800/80 bg-surface-950/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-semibold text-surface-200">
              {title || 'Admin Management Console'}
            </h1>
            {subtitle && <p className="text-xs text-surface-500">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-900 border border-surface-800 text-xs font-medium">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  isSupabaseReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                )}
              />
              <span className="text-surface-300">
                {isSupabaseReady ? 'Supabase Connected' : 'Demo Mode'}
              </span>
            </div>

            {/* Language switch */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-900 border border-surface-800 hover:border-surface-700 text-xs font-semibold text-surface-300 hover:text-white transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-primary-400" />
              <span>{isBengali ? 'বাং' : 'EN'}</span>
            </button>

            {/* Theme switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full bg-surface-900 border border-surface-800 hover:border-surface-700 text-surface-300 hover:text-white transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-primary-400" />
              )}
            </button>

            {/* Direct Link to Portfolio */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-600/10 hover:bg-primary-600/20 text-primary-300 border border-primary-500/30 text-xs font-medium transition-all"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
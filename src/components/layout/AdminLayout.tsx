import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  FileText,
  Code,
  Briefcase,
  MessageSquare,
  Clock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminLayoutProps {
  children: React.ReactNode;
  unreadCount?: number;
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  exact?: boolean;
}

export default function AdminLayout({ children, unreadCount = 0 }: AdminLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Prevent scrolling when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Profile',
      path: '/admin/profile',
      icon: User,
    },
    {
      name: 'Projects',
      path: '/admin/projects',
      icon: FolderOpen,
    },
    {
      name: 'Blog',
      path: '/admin/blog',
      icon: FileText,
    },
    {
      name: 'Skills',
      path: '/admin/skills',
      icon: Code,
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: Briefcase,
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Journey',
      path: '/admin/journey',
      icon: Clock,
    },
  ];

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const isNavActive = (item: NavItem) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 flex flex-col md:flex-row antialiased selection:bg-primary-500/30 selection:text-white">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR                                          */}
      {/* ======================================================== */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-30 bg-surface-900/90 border-r border-surface-800/80 backdrop-blur-xl">
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-surface-800/80">
          <Link
            to="/admin"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-base tracking-wide">
                  SUBHASISH
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-surface-400 font-mono tracking-wider uppercase">
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        {/* Quick public site link */}
        <div className="px-4 pt-4 pb-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-surface-400 hover:text-primary-400 bg-surface-950/60 hover:bg-surface-800/50 rounded-lg border border-surface-800/60 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Portfolio
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-surface-500 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-primary-500/15 to-accent-500/10 text-white border border-primary-500/30 shadow-sm shadow-primary-500/10'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? 'text-primary-400'
                        : 'text-surface-400 group-hover:text-surface-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout at Bottom */}
        <div className="p-4 border-t border-surface-800/80 bg-surface-950/40">
          <div className="flex items-center gap-3 mb-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500/30 to-accent-500/30 border border-primary-500/40 flex items-center justify-center text-primary-300 font-bold text-xs uppercase shadow-inner">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.email || 'Admin User'}
              </p>
              <p className="text-[10px] text-surface-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Authenticated
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE TOP NAVIGATION BAR                                */}
      {/* ======================================================== */}
      <header className="md:hidden sticky top-0 z-40 h-16 bg-surface-900/95 border-b border-surface-800 backdrop-blur-xl flex items-center justify-between px-4">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm tracking-wide">
              SUBHASISH
            </span>
            <span className="text-[10px] text-surface-400 block -mt-1 font-mono">
              Admin
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View public site"
            className="p-2 text-surface-400 hover:text-primary-400 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 text-surface-300 hover:text-white rounded-lg hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE DRAWER / SIDEBAR                                  */}
      {/* ======================================================== */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            aria-hidden="true"
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-surface-900 border-r border-surface-800 flex flex-col h-full shadow-2xl z-10 animate-in">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-white text-sm">
                  SUBHASISH Admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-surface-500 mb-2">
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item);

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Drawer Bottom with User & Logout */}
            <div className="p-4 border-t border-surface-800 bg-surface-950/60">
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 font-bold text-xs uppercase">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {user?.email || 'Admin'}
                  </p>
                  <p className="text-[10px] text-surface-400">Administrator</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

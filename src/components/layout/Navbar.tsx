import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  type: 'section' | 'page';
  path: string;
  sectionId?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav.home', fallbackLabel: 'Home', type: 'section', path: '/#home', sectionId: 'home' },
  { id: 'about', labelKey: 'nav.about', fallbackLabel: 'About', type: 'section', path: '/#about', sectionId: 'about' },
  { id: 'skills', labelKey: 'nav.skills', fallbackLabel: 'Skills', type: 'section', path: '/#skills', sectionId: 'skills' },
  { id: 'projects', labelKey: 'nav.projects', fallbackLabel: 'Projects', type: 'section', path: '/#projects', sectionId: 'projects' },
  { id: 'services', labelKey: 'nav.services', fallbackLabel: 'Services', type: 'section', path: '/#services', sectionId: 'services' },
  { id: 'blog', labelKey: 'nav.blog', fallbackLabel: 'Blog', type: 'page', path: '/blog' },
  { id: 'contact', labelKey: 'nav.contact', fallbackLabel: 'Contact', type: 'section', path: '/#contact', sectionId: 'contact' },
];

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const lastScrollY = useRef<number>(0);
  const isBengali = i18n.language ? i18n.language.startsWith('bn') : false;

  // Track scroll direction to show/hide navbar and detect scrolled background state
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update background blur and shadow state when scrolled
      setIsScrolled(currentScrollY > 20);

      // Keep navbar visible if mobile drawer is open or near top of the page
      if (isMobileMenuOpen || currentScrollY <= 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide on scroll down, show on scroll up with scroll delta threshold
      const scrollDiff = currentScrollY - lastScrollY.current;
      if (scrollDiff > 8) {
        setIsVisible(false);
      } else if (scrollDiff < -8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  // Handle active section tracking using IntersectionObserver on the homepage
  useEffect(() => {
    // When visiting non-home routes like /blog
    if (location.pathname !== '/') {
      if (location.pathname.startsWith('/blog')) {
        setActiveSection('blog');
      } else {
        setActiveSection('');
      }
      return;
    }

    // Scroll to top listener for activating 'home' section at the top of homepage
    const handleScrollTop = () => {
      if (window.scrollY < 120) {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', handleScrollTop, { passive: true });

    // Section IDs to observe
    const sectionIds = ['home', 'about', 'skills', 'projects', 'services', 'contact'];

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0 && window.scrollY >= 120) {
        // Pick the visible section with highest intersection ratio or closest to viewport center
        const bestEntry = visibleEntries.reduce((prev, curr) =>
          curr.intersectionRatio > prev.intersectionRatio ? curr : prev
        );
        const resolvedId = bestEntry.target.id === 'hero' ? 'home' : bestEntry.target.id;
        setActiveSection(resolvedId);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: [0.1, 0.25, 0.5, 0.75],
    });

    sectionIds.forEach((id) => {
      const element =
        document.getElementById(id) ||
        (id === 'home' ? document.getElementById('hero') : null);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTop);
    };
  }, [location.pathname]);

  // Handle smooth scrolling if landing on homepage with a hash (e.g. from /blog)
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');
      const element =
        document.getElementById(targetId) ||
        (targetId === 'home' ? document.getElementById('hero') : null);

      if (element) {
        const timer = setTimeout(() => {
          const navOffset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - navOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
          setActiveSection(targetId);
        }, 120);

        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, location.hash]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Toggle Language between English and Bengali
  const toggleLanguage = useCallback(() => {
    const nextLang = isBengali ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
    document.documentElement.lang = nextLang;
  }, [i18n, isBengali]);

  // Smooth scroll handler for section navigation
  const scrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '/');
      setActiveSection('home');
      return;
    }

    const element =
      document.getElementById(sectionId) ||
      (sectionId === 'home' ? document.getElementById('hero') : null);

    if (element) {
      const navOffset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      history.pushState(null, '', `#${sectionId}`);
      setActiveSection(sectionId);
    }
  }, []);

  // Handle navigation clicks for both desktop and mobile
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }

      if (item.type === 'section') {
        if (location.pathname === '/') {
          e.preventDefault();
          scrollToSection(item.sectionId || 'home');
        } else {
          // If on subpage (e.g. /blog), allow React Router Link to navigate to /#sectionId
        }
      }
    },
    [isMobileMenuOpen, location.pathname, scrollToSection]
  );

  // Logo click: scroll to top on home, or navigate to /
  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, '', '/');
        setActiveSection('home');
      }
    },
    [isMobileMenuOpen, location.pathname]
  );

  return (
    <>
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[60] px-4 py-2 bg-primary-600 text-white rounded-lg font-medium shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
      >
        Skip to main content
      </a>

      {/* Sticky / Floating Navigation Header */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : '-100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
          'bg-surface-950/80 backdrop-blur-xl',
          'border-b',
          isScrolled
            ? 'border-surface-800/80 shadow-lg shadow-black/20 dark:border-surface-800/80'
            : 'border-surface-800/40 shadow-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Main Navigation"
            className="flex items-center justify-between h-16 sm:h-20"
          >
            {/* Wordmark / Brand Logo on Left */}
            <div className="flex items-center flex-shrink-0">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="group flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg p-1 transition-transform duration-200 active:scale-95"
                aria-label="Subhasish Portfolio Home"
              >
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-wider uppercase bg-gradient-to-r from-primary-400 via-accent-400 to-electric-light bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-300">
                  SUBHASISH
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-accent-400 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <ul className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const label = t(item.labelKey, item.fallbackLabel);

                return (
                  <li key={item.id} className="relative">
                    <Link
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        isActive
                          ? 'text-primary-400 font-semibold'
                          : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
                      )}
                    >
                      {label}

                      {/* Animated Active Pill Indicator */}
                      {isActive && (
                        <motion.span
                          layoutId="desktop-active-indicator"
                          className="absolute inset-0 rounded-full bg-primary-500/15 border border-primary-500/30 -z-10 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop Action Controls (Language + Theme) */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {/* Language Switcher Toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={t('nav.language', 'Change Language')}
                title={isBengali ? 'Switch to English' : 'বাংলায় দেখুন'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-surface-700/80 bg-surface-900/60 hover:bg-surface-800/80 hover:border-surface-600 text-surface-300 hover:text-white text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Globe className="w-3.5 h-3.5 text-primary-400" aria-hidden="true" />
                <span>{isBengali ? 'বাং' : 'EN'}</span>
                <span className="text-[10px] text-surface-500 uppercase font-mono">
                  / {isBengali ? 'EN' : 'বাং'}
                </span>
              </button>

              {/* Theme Switcher Toggle */}
              <motion.button
                type="button"
                onClick={toggleTheme}
                whileTap={{ scale: 0.92 }}
                aria-label={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className="relative p-2 rounded-full border border-surface-700/80 bg-surface-900/60 hover:bg-surface-800/80 hover:border-surface-600 text-surface-300 hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0, rotate: 90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4 text-primary-400" aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Controls & Hamburger Button */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Quick Language Toggle on Mobile */}
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={t('nav.language', 'Change Language')}
                className="p-2 rounded-lg border border-surface-800 bg-surface-900/70 text-surface-300 hover:text-white text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="text-primary-400">{isBengali ? 'বাং' : 'EN'}</span>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="p-2 rounded-lg border border-surface-800 bg-surface-900/70 text-surface-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-white" aria-hidden="true" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Drawer and Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              key="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />

            {/* Slide-in Mobile Drawer */}
            <motion.div
              id="mobile-navigation-drawer"
              key="mobile-drawer-content"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[82%] max-w-sm bg-surface-950/95 backdrop-blur-2xl border-l border-surface-800 flex flex-col justify-between shadow-2xl p-6 md:hidden overflow-y-auto"
            >
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-surface-800/80">
                  <Link
                    to="/"
                    onClick={handleLogoClick}
                    className="flex items-center gap-1.5 focus:outline-none"
                  >
                    <span className="font-display font-extrabold text-lg tracking-wider uppercase bg-gradient-to-r from-primary-400 via-accent-400 to-electric-light bg-clip-text text-transparent">
                      SUBHASISH
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile Navigation List */}
                <nav className="mt-6" aria-label="Mobile Menu Links">
                  <ul className="space-y-1.5">
                    {NAV_ITEMS.map((item, idx) => {
                      const isActive = activeSection === item.id;
                      const label = t(item.labelKey, item.fallbackLabel);

                      return (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx, duration: 0.25 }}
                        >
                          <Link
                            to={item.path}
                            onClick={(e) => handleNavClick(e, item)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                              'flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                              isActive
                                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 font-semibold'
                                : 'text-surface-300 hover:text-white hover:bg-surface-900/70'
                            )}
                          >
                            <span>{label}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            )}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Drawer Footer with Controls */}
              <div className="pt-6 mt-6 border-t border-surface-800/80 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  {/* Language Selector */}
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    aria-label={t('nav.language', 'Change Language')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-surface-800 bg-surface-900 text-sm font-medium text-surface-200 hover:text-white hover:border-surface-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Globe className="w-4 h-4 text-primary-400" aria-hidden="true" />
                    <span>{isBengali ? 'বাংলা' : 'English'}</span>
                  </button>

                  {/* Theme Selector */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={
                      theme === 'dark'
                        ? 'Switch to light mode'
                        : 'Switch to dark mode'
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-surface-800 bg-surface-900 text-sm font-medium text-surface-200 hover:text-white hover:border-surface-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                        <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-primary-400" aria-hidden="true" />
                        <span>Dark</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-surface-500">
                    &copy; {new Date().getFullYear()} Subhasish Dev Adhikary
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

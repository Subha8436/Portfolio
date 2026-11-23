import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Heart, ArrowUpRight } from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/Icons';

export default function Footer(): React.JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: t('nav.home', 'Home'), href: '/' },
    { label: t('nav.about', 'About'), href: '/#about' },
    { label: t('nav.projects', 'Projects'), href: '/#projects' },
    { label: t('nav.blog', 'Blog'), href: '/blog' },
    { label: t('nav.contact', 'Contact'), href: '/#contact' },
  ];

  const connectLinks = [
    {
      name: t('contact.github', 'GitHub'),
      href: 'https://github.com/Subha8436',
      icon: Github,
      username: '@Subha8436',
    },
    {
      name: t('contact.linkedin', 'LinkedIn'),
      href: 'https://www.linkedin.com/in/subhasish-dev-adhikary-742061281/',
      icon: Linkedin,
      username: 'subhasish-dev-adhikary',
    },
    {
      name: t('contact.email', 'Email'),
      href: 'mailto:subhasishdebadhikari@gmail.com',
      icon: Mail,
      username: 'subhasishdebadhikari@gmail.com',
    },
  ];

  const handleSmoothScroll = (href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (location.pathname === '/') {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    } else if (href === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-surface-100 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800/80 backdrop-blur-md transition-colors duration-300 overflow-hidden">
      {/* Gradient accent line at top of footer */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/80 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/30 via-accent-500/20 to-transparent blur-[1px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom pt-14 pb-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-12">
          {/* Brand & Tagline Column */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <Link
                to="/"
                onClick={() => handleSmoothScroll('/')}
                className="inline-flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
                aria-label={t('footer.wordmark', 'SUBHASISH')}
              >
                <span className="font-display text-2xl sm:text-3xl font-black tracking-wider text-surface-900 dark:text-white transition-colors duration-200">
                  {t('footer.wordmark', 'SUBHASISH')}
                  <span className="text-primary-500 inline-block transition-transform duration-300 group-hover:scale-125">
                    .
                  </span>
                </span>
              </Link>

              <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-400 max-w-sm">
                {t('footer.tagline', 'Building digital experiences with curiosity and code.')}
              </p>
            </div>

            {/* Subtle learning badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-200/60 dark:bg-surface-800/60 border border-surface-300/50 dark:border-surface-700/50 text-xs text-surface-600 dark:text-surface-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{t('hero.status', 'Currently Learning')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-surface-900 dark:text-white mb-4">
              {t('footer.quickLinks', 'Quick Links')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => handleSmoothScroll(link.href)}
                    className="group inline-flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 focus:outline-none focus-visible:underline"
                  >
                    <span className="h-0.5 w-0 bg-primary-500 rounded-full transition-all duration-200 group-hover:w-2" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div className="md:col-span-4 lg:col-span-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-surface-900 dark:text-white mb-4">
              {t('footer.connect', 'Connect')}
            </h3>
            <div className="flex flex-col gap-2.5">
              {connectLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-white/60 dark:bg-surface-850/60 hover:bg-white dark:hover:bg-surface-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:shadow-sm hover:shadow-primary-500/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label={`${item.name} (${item.username})`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-lg bg-surface-100 dark:bg-surface-900 text-surface-600 dark:text-surface-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:scale-105 transition-all duration-200 shrink-0">
                      <item.icon className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-surface-400 dark:text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Built-with Note */}
        <div className="pt-8 border-t border-surface-200/80 dark:border-surface-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500 dark:text-surface-400">
          <p className="text-center sm:text-left">
            © {currentYear} {t('footer.author', 'Subhasish Dev Adhikary')}.{' '}
            {t('footer.rights', 'All rights reserved.')}
          </p>

          <p className="flex items-center justify-center sm:justify-end gap-1.5 text-center">
            <span>{t('footer.builtWith', 'Built with React, TypeScript & Supabase')}</span>
            <Heart
              className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse shrink-0"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}

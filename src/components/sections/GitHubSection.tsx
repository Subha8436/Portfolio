import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, GitFork, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Github } from '@/components/ui/Icons';
import { fetchGitHubRepos } from '@/lib/github';
import SectionHeader from '@/components/ui/SectionHeader';
import { formatDate } from '@/lib/utils';
import type { GitHubRepo } from '@/types';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  TypeScript: '#3178c6',
};

const DEFAULT_LANGUAGE_COLOR = '#8b949e';

const getLanguageColor = (language: string | null): string => {
  if (!language) return DEFAULT_LANGUAGE_COLOR;
  return LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};

export default function GitHubSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGitHubRepos();
      if (!data || data.length === 0) {
        setError(t('github.noRepos', 'Unable to load repositories at this time.'));
      } else {
        setRepos(data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('github.noRepos', 'Unable to load repositories at this time.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  return (
    <section
      id="github"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Decorative background glows */}
      <div
        className="absolute top-1/4 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <SectionHeader
            title={t('github.sectionTitle', 'GitHub Activity')}
            subtitle={t(
              'github.sectionSubtitle',
              'My open source contributions and repositories'
            )}
          />
        </motion.div>

        {/* Loading State: Skeleton Cards */}
        {loading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Loading repositories"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="glass rounded-xl p-6 border border-white/10 dark:border-white/10 bg-surface-900/40 animate-pulse flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 bg-surface-700/60 rounded w-1/2" />
                    <div className="h-4 w-4 bg-surface-700/60 rounded" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3.5 bg-surface-800/80 rounded w-full" />
                    <div className="h-3.5 bg-surface-800/80 rounded w-4/5" />
                  </div>
                </div>
                <div className="pt-4 border-t border-surface-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-700/80" />
                      <div className="h-3 w-12 bg-surface-700/80 rounded" />
                    </div>
                    <div className="h-3 w-8 bg-surface-800/80 rounded" />
                    <div className="h-3 w-8 bg-surface-800/80 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-surface-800/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto border border-white/10 dark:border-white/10 bg-surface-900/50 backdrop-blur-xl"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-2">
              {t('common.error', 'Unable to Load Repositories')}
            </h3>
            <p className="text-surface-400 text-sm mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              type="button"
              onClick={loadRepos}
              className="btn-secondary inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('common.retry', 'Try Again')}</span>
            </button>
          </motion.div>
        )}

        {/* Repos Grid */}
        {!loading && !error && repos.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {repos.map((repo) => (
              <motion.article
                key={repo.id}
                variants={cardVariants}
                className="glass rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10 group relative border border-white/10 dark:border-white/10 bg-surface-900/40 backdrop-blur-md"
              >
                <div>
                  {/* Repository Name & External Link */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display font-bold text-lg text-white group-hover:text-primary-400 transition-colors flex items-center gap-2 line-clamp-1"
                      title={repo.name}
                    >
                      <span className="truncate">{repo.name}</span>
                    </a>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${repo.name} repository on GitHub`}
                      className="text-surface-400 hover:text-primary-400 transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Description (truncated to 2 lines) */}
                  <p className="text-sm text-surface-400 line-clamp-2 min-h-[2.5rem] mb-4 leading-relaxed">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {/* Topics / Tags (if available) */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata Footer: Language, Stars, Forks, Updated Date */}
                  <div className="pt-4 border-t border-surface-800/60 dark:border-surface-800/60 flex flex-wrap items-center justify-between text-xs text-surface-400 gap-y-2">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Language indicator */}
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                          style={{
                            backgroundColor: getLanguageColor(repo.language),
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-surface-300 truncate max-w-[80px]">
                          {repo.language || 'Plain Text'}
                        </span>
                      </div>

                      {/* Stars Count */}
                      <span
                        className="flex items-center gap-1 text-surface-400 hover:text-amber-400 transition-colors"
                        title={`${repo.stargazers_count} stars`}
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{repo.stargazers_count}</span>
                      </span>

                      {/* Forks Count */}
                      <span
                        className="flex items-center gap-1 text-surface-400 hover:text-primary-400 transition-colors"
                        title={`${repo.forks_count} forks`}
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>{repo.forks_count}</span>
                      </span>
                    </div>

                    {/* Last updated date (formatted) */}
                    <span
                      className="text-[11px] text-surface-500 whitespace-nowrap"
                      title={`Last updated: ${formatDate(repo.updated_at)}`}
                    >
                      {formatDate(repo.updated_at)}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* View GitHub Profile Button */}
        <div className="mt-12 text-center">
          <a
            href="https://github.com/Subha8436"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 group shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300"
          >
            <Github className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span>{t('github.viewProfile', 'View GitHub Profile')}</span>
            <ExternalLink className="w-4 h-4 ml-0.5 opacity-70 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </section>
  );
}

export { GitHubSection };

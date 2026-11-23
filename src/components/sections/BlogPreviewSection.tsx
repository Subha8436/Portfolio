import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';
import {
  NotebookPen,
  PenTool,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { formatDate, calculateReadingTime, truncate } from '../../lib/utils';
import type { BlogPost } from '../../types';

export { SectionHeader };

export interface BlogPreviewSectionProps {
  /** Optional pre-fetched blog posts. If omitted, recent posts are fetched from Supabase. */
  posts?: BlogPost[];
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function BlogPreviewSection({
  posts: propPosts,
  className = '',
}: BlogPreviewSectionProps) {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>(propPosts ?? []);
  const [loading, setLoading] = useState<boolean>(propPosts === undefined);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (propPosts !== undefined) {
      setPosts(propPosts);
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    async function fetchRecentPosts() {
      try {
        if (!isSupabaseConfigured()) {
          if (isSubscribed) {
            setPosts([]);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching blog posts for preview:', error);
          if (isSubscribed) setPosts([]);
        } else if (isSubscribed) {
          setPosts((data as BlogPost[]) || []);
        }
      } catch (err) {
        console.error('Failed to load blog preview posts:', err);
        if (isSubscribed) setPosts([]);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchRecentPosts();

    return () => {
      isSubscribed = false;
    };
  }, [propPosts]);

  const recentPosts = (posts || []).slice(0, 3);
  const hasPosts = !loading && recentPosts.length > 0;
  const currentLocale = i18n.language === 'bn' ? 'bn-IN' : 'en-US';

  const handleImageError = (postId: string) => {
    setImageErrorMap((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <section
      id="blog"
      className={`section-padding relative overflow-hidden bg-surface-950 text-surface-200 ${className}`}
    >
      {/* Background ambient lighting effects */}
      <div
        className="pointer-events-none absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-primary-600/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -right-48 h-96 w-96 rounded-full bg-accent-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <SectionHeader
          title={t('blog.sectionTitle', 'Latest Articles')}
          subtitle={t('blog.sectionSubtitle', 'Thoughts and tutorials')}
        />

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((index) => (
              <div
                key={`blog-skeleton-${index}`}
                className="animate-pulse flex flex-col overflow-hidden rounded-2xl border border-surface-800 bg-surface-900/40 p-5"
              >
                <div className="h-48 w-full rounded-xl bg-surface-800/60 mb-5" />
                <div className="h-5 w-24 rounded-full bg-surface-800 mb-3" />
                <div className="h-6 w-3/4 rounded bg-surface-800 mb-3" />
                <div className="h-4 w-full rounded bg-surface-800/70 mb-2" />
                <div className="h-4 w-5/6 rounded bg-surface-800/70 mb-6" />
                <div className="mt-auto flex justify-between pt-4 border-t border-surface-800/60">
                  <div className="h-4 w-28 rounded bg-surface-800/60" />
                  <div className="h-4 w-20 rounded bg-surface-800/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !hasPosts && (
          <motion.div
            variants={emptyStateVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="mx-auto max-w-xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-surface-800/80 bg-surface-900/50 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-surface-700">
              {/* Subtle card glow accents */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-primary-500/10 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-accent-500/10 blur-2xl"
                aria-hidden="true"
              />

              {/* Notebook & Pen Animated Icon */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 via-surface-900 to-accent-500/20 border border-primary-500/30 text-primary-400 shadow-xl shadow-primary-500/5"
              >
                <NotebookPen className="h-9 w-9 text-primary-400" strokeWidth={1.75} />
                <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-950 border border-accent-500/40 text-accent-400 shadow-md">
                  <PenTool className="h-3.5 w-3.5" />
                </div>
              </motion.div>

              {/* Attractive Empty Message */}
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t('blog.noPosts', 'No articles published yet. Check back soon!')}
              </h3>

              <p className="mt-3 text-sm sm:text-base text-surface-400 leading-relaxed max-w-md mx-auto">
                Articles on modern web architecture, AI-powered applications, and practical developer insights are on the way.
              </p>

              {/* View All Articles link */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/blog"
                  className="btn-secondary group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all"
                >
                  <span>{t('blog.viewAll', 'View All Articles')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* When Posts Exist: Responsive Grid */}
        {hasPosts && (
          <div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {recentPosts.map((post) => {
                const hasCover = Boolean(post.cover_image_url) && !imageErrorMap[post.id];
                const postDate = post.published_at || post.created_at;
                const readingTime = post.reading_time || calculateReadingTime(post.content || '');

                return (
                  <motion.article
                    key={post.id}
                    variants={cardVariants}
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/10"
                  >
                    {/* Cover Image or Attractive Placeholder */}
                    <div className="relative h-48 w-full overflow-hidden bg-surface-850">
                      {hasCover ? (
                        <img
                          src={post.cover_image_url as string}
                          alt={post.title}
                          loading="lazy"
                          onError={() => handleImageError(post.id)}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        /* Cover Image Placeholder */
                        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-surface-850 via-surface-900 to-surface-950 p-6 text-center select-none">
                          {/* Decorative geometric background pattern */}
                          <div
                            className="absolute inset-0 opacity-15"
                            style={{
                              backgroundImage:
                                'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)',
                              backgroundSize: '16px 16px',
                            }}
                          />
                          {/* Center placeholder icon */}
                          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-800/80 border border-surface-700/60 text-primary-400 shadow-inner group-hover:border-primary-500/50 group-hover:text-primary-300 transition-colors">
                            <BookOpen className="h-7 w-7" />
                          </div>
                          <span className="relative z-10 mt-3 font-mono text-xs uppercase tracking-wider text-surface-400">
                            {post.category || 'Article'}
                          </span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-950/80 px-3 py-1 text-xs font-medium text-primary-300 backdrop-blur-md border border-primary-500/30 shadow-md">
                          <Sparkles className="h-3 w-3 text-primary-400" />
                          {post.category || 'Technology'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-6">
                      {/* Published Date + Reading Time */}
                      <div className="flex items-center gap-4 text-xs text-surface-400 mb-3">
                        {postDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary-400" />
                            <span>{formatDate(postDate, currentLocale)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-accent-400" />
                          <span>
                            {readingTime} {t('blog.minRead', 'min read')}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-xl font-bold text-white transition-colors duration-200 group-hover:text-primary-400 line-clamp-2 mb-2.5">
                        <Link to={`/blog/${post.slug}`} className="hover:underline focus:outline-none">
                          {post.title}
                        </Link>
                      </h3>

                      {/* Excerpt (truncated) */}
                      <p className="text-sm text-surface-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                        {truncate(post.excerpt || post.content || '', 130)}
                      </p>

                      {/* "Read More" link */}
                      <div className="pt-4 border-t border-surface-800/80 flex items-center justify-between">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="group/link inline-flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors focus:outline-none"
                        >
                          <span>{t('blog.readMore', 'Read More')}</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>

            {/* "View All Articles" button linking to /blog */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Link
                to="/blog"
                className="btn-secondary group inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/10"
              >
                <span>{t('blog.viewAll', 'View All Articles')}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

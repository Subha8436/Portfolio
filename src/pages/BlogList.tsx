import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Home,
  X,
  Sparkles,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { BlogPost } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatDate, calculateReadingTime, cn } from '../lib/utils';

const CATEGORIES = [
  'All',
  'AI',
  'Web Development',
  'Python',
  'JavaScript',
  'Automation',
  'Tutorials',
] as const;

type Category = (typeof CATEGORIES)[number];

const POSTS_PER_PAGE = 6;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const BlogList: React.FC = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch published blog posts from Supabase if configured
  useEffect(() => {
    let isMounted = true;

    async function fetchBlogPosts() {
      try {
        setLoading(true);
        if (!isSupabaseConfigured()) {
          if (isMounted) {
            setPosts([]);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false, nullsFirst: false });

        if (error) {
          console.error('Error fetching blog posts from Supabase:', error);
          if (isMounted) setPosts([]);
        } else if (isMounted) {
          setPosts((data as BlogPost[]) || []);
        }
      } catch (err) {
        console.error('Unexpected error loading blog posts:', err);
        if (isMounted) setPosts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBlogPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        post.tags?.some(
          (tag) => tag.toLowerCase() === selectedCategory.toLowerCase()
        );

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const titleMatch = post.title?.toLowerCase().includes(query);
      const excerptMatch = post.excerpt?.toLowerCase().includes(query);
      const categoryMatch = post.category?.toLowerCase().includes(query);
      const tagMatch = post.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return titleMatch || excerptMatch || categoryMatch || tagMatch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset page when category or search changes
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Safe date formatter helper
  const renderDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return formatDate(dateStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200">
      <Helmet>
        <title>{t('nav.blog', 'Blog')} | Subhasish Dev Adhikary</title>
        <meta
          name="description"
          content="Articles, tutorials, and technical insights on AI, Web Development, Python, JavaScript, and Automation by Subhasish Dev Adhikary."
        />
        <meta
          property="og:title"
          content={`${t('nav.blog', 'Blog')} | Subhasish Dev Adhikary`}
        />
        <meta
          property="og:description"
          content="Explore articles, tutorials, and practical engineering guides on AI, Web Development, Python, JavaScript, and Automation."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://subhasish.dev/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${t('nav.blog', 'Blog')} | Subhasish Dev Adhikary`}
        />
        <meta
          name="twitter:description"
          content="Articles, tutorials, and technical insights on AI, Web Development, Python, JavaScript, and Automation."
        />
      </Helmet>

      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container-custom section-padding pt-24 md:pt-28">
        {/* Breadcrumb: Home > Blog */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Breadcrumb"
          className="mb-8"
        >
          <ol className="flex items-center gap-2 text-sm text-surface-400">
            <li>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-400"
              >
                <Home className="w-4 h-4" />
                <span>{t('nav.home', 'Home')}</span>
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-4 h-4 text-surface-600" />
            </li>
            <li>
              <span
                className="font-medium text-surface-100"
                aria-current="page"
              >
                {t('nav.blog', 'Blog')}
              </span>
            </li>
          </ol>
        </motion.nav>

        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('blog.sectionSubtitle', 'Thoughts and tutorials')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4">
            <span className="gradient-text">{t('nav.blog', 'Blog')}</span>
          </h1>
          <p className="text-surface-400 text-base sm:text-lg leading-relaxed">
            Exploring artificial intelligence, modern web technologies, workflow
            automation, and sharing hands-on lessons learned along the journey.
          </p>
        </motion.header>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="relative">
            <label htmlFor="blog-search" className="sr-only">
              {t('blog.search', 'Search articles...')}
            </label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="blog-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('blog.search', 'Search articles...')}
              className="w-full pl-12 pr-11 py-3.5 bg-surface-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-surface-500 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none px-1">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
                    isSelected
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/25 ring-1 ring-white/20'
                      : 'bg-surface-900/60 hover:bg-surface-800/80 text-surface-400 hover:text-surface-100 border border-white/5 hover:border-white/10'
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Section: Loading | Empty State | Post Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-surface-400 text-sm">
              {t('common.loading', 'Loading articles...')}
            </p>
          </div>
        ) : posts.length === 0 ? (
          /* Empty state when no posts exist initially */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl mx-auto py-16 px-6 text-center"
          >
            <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
              {/* Subtle inner radial gradient */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* BookOpen Icon with glowing wrapper */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center mb-6 shadow-inner">
                <BookOpen className="w-10 h-10 text-primary-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                {t('blog.noPosts', 'No articles published yet. Check back soon!')}
              </h2>
              <p className="text-surface-400 text-sm sm:text-base leading-relaxed mb-8">
                I am currently writing articles and deep-dive tutorials on AI
                applications, full-stack web development, and workflow
                automation. Check back soon for new updates!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>{t('common.back', 'Back to Home')}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : filteredPosts.length === 0 ? (
          /* Empty state when search or category filter yields no results */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto py-16 px-6 text-center"
          >
            <div className="glass rounded-3xl p-8 border border-white/10">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-800/80 border border-white/10 flex items-center justify-center mb-5 text-surface-400">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No articles found
              </h2>
              <p className="text-surface-400 text-sm mb-6">
                No posts matched your search for &quot;
                {searchQuery || selectedCategory}&quot;. Try adjusting your
                keywords or filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-sm font-medium border border-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Filters</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Grid of Blog Posts when posts exist */
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12"
            >
              <AnimatePresence mode="popLayout">
                {paginatedPosts.map((post) => (
                  <motion.article
                    key={post.id || post.slug}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass card-hover rounded-2xl overflow-hidden border border-white/10 group flex flex-col h-full bg-surface-900/40"
                  >
                    {/* Cover Image or Fallback Banner */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block relative aspect-video overflow-hidden bg-surface-900 focus:outline-none"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-surface-800 via-surface-900 to-primary-950/40 flex items-center justify-center relative p-6">
                          <div className="absolute inset-0 bg-grid-white/[0.02]" />
                          <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        </div>
                      )}

                      {/* Category Badge overlay on image */}
                      {post.category && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-950/80 backdrop-blur-md text-primary-300 border border-white/10 uppercase tracking-wider">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Tags (if any) */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] text-surface-400 bg-surface-800/60 px-2 py-0.5 rounded-md"
                            >
                              <Tag className="w-2.5 h-2.5 text-primary-400" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Title */}
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="focus:outline-none focus:text-primary-400"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      {/* Post Excerpt */}
                      <p className="text-surface-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                        {post.excerpt ||
                          (post.content
                            ? post.content.replace(/[#*`]/g, '').slice(0, 140) +
                              '...'
                            : '')}
                      </p>

                      {/* Post Meta: Date & Reading Time */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-surface-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-surface-500" />
                          <span>
                            {renderDate(post.published_at || post.created_at) ||
                              'Recently'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-surface-500" />
                          <span>
                            {post.reading_time ||
                              calculateReadingTime(post.content || '')}{' '}
                            {t('blog.minRead', 'min read')}
                          </span>
                        </div>
                      </div>

                      {/* Read More Link */}
                      <div>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 group-hover:text-primary-300 transition-colors focus:outline-none"
                        >
                          <span>{t('blog.readMore', 'Read More')}</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-surface-900 border border-white/10 text-surface-300 hover:text-white hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          'w-9 h-9 rounded-xl text-sm font-medium transition-all',
                          currentPage === page
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-surface-900 text-surface-400 hover:text-white hover:bg-surface-800 border border-white/5'
                        )}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-surface-900 border border-white/10 text-surface-300 hover:text-white hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;

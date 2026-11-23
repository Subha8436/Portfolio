import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Home,
  BookOpen,
  FileQuestion,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Linkedin, Twitter } from '@/components/ui/Icons';
import { BlogPost as BlogPostType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatDate, calculateReadingTime, prefersReducedMotion } from '../lib/utils';

/**
 * Custom CodeBlock component for Markdown code snippets.
 * Displays syntax language, copy-to-clipboard action, and formatted code.
 */
interface CodeBlockProps {
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  let codeText = '';
  let language = '';

  if (React.isValidElement(children) && (children as React.ReactElement<{ className?: string; children?: React.ReactNode }>).props) {
    const props = (children as React.ReactElement<{ className?: string; children?: React.ReactNode }>).props;
    codeText = String(props.children || '').replace(/\n$/, '');
    const className = props.className || '';
    const match = /language-(\w+)/.exec(className);
    if (match) {
      language = match[1];
    }
  }

  const handleCopy = async () => {
    if (!codeText) return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
      const textArea = document.createElement('textarea');
      textArea.value = codeText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-surface-800 bg-surface-900 shadow-xl group">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-800 bg-surface-950/80 text-xs">
        <span className="font-mono uppercase tracking-wider font-semibold text-primary-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-surface-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto text-sm font-mono leading-relaxed text-surface-200">
        {children}
      </div>
    </div>
  );
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const reducedMotion = prefersReducedMotion();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: reducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Fetch post data
  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!slug) {
        if (isMounted) {
          setPost(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      // Support preview / demo mode if explicitly triggered in URL
      const isPreview = searchParams.get('preview') === 'true' || slug === 'demo';

      if (isPreview) {
        if (isMounted) {
          setPost({
            id: 'demo-post-id',
            title: 'Building Modern AI-Powered Web Applications with React & Supabase',
            slug: slug,
            excerpt:
              'A comprehensive deep dive into designing, developing, and architecting real-world AI applications with modern frontend frameworks and scalable backend services.',
            content: `
## Introduction

Modern web development is undergoing an extraordinary transformation with the convergence of **Artificial Intelligence** and reactive frontend frameworks. Building scalable, intuitive digital experiences requires thoughtful architecture, responsive design systems, and seamless API integrations.

In this guide, we explore the essential patterns for building robust digital products.

### Architectural Blueprint

When building AI-powered SaaS platforms or portfolio applications, clean separation of concerns is vital:

- **Frontend Core**: React 19, TypeScript, Tailwind CSS, and Framer Motion for tactile fluid interactions.
- **Backend & Data Layer**: Supabase PostgreSQL with Row Level Security (RLS) and real-time event subscriptions.
- **AI Integration**: Edge functions streaming completions with structured JSON outputs.

\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

// Initialize resilient client with environment fallback
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function fetchPublishedArticles() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, reading_time, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data;
}
\`\`\`

### Key Benchmarks & Comparison

Here is how modern architectures stack up in developer velocity and performance:

| Feature / Metric | Traditional Monolith | Modern Jamstack / Supabase | AI-Augmented Architecture |
| :--- | :--- | :--- | :--- |
| **Time to First Byte** | 240ms | 45ms | 38ms (Edge Cached) |
| **Data Synchronization** | Polling / Cron | Realtime WebSockets | Event-driven SSE |
| **Maintenance Overhead** | High | Minimal | Automated & Streamlined |

> "Simplicity is prerequisite for reliability. Build solid foundations with TypeScript, craft thoughtful UI interfaces, and leverage scalable cloud primitives."

### Next Steps & Exploration

Experiment with edge compute, optimize your bundle splits, and always prioritize accessible user experiences across desktop and mobile devices.
            `.trim(),
            cover_image_url:
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            category: 'Engineering & AI',
            tags: ['React', 'TypeScript', 'Supabase', 'AI', 'TailwindCSS'],
            status: 'published',
            featured: true,
            reading_time: 4,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setRelatedPosts([
            {
              id: 'related-1',
              title: 'Mastering Framer Motion in Modern React Applications',
              slug: 'mastering-framer-motion',
              excerpt:
                'How to design smooth, fluid micro-interactions and page transitions without impacting rendering performance.',
              content: '',
              cover_image_url:
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
              category: 'Frontend',
              tags: ['React', 'FramerMotion', 'UI/UX'],
              status: 'published',
              featured: false,
              reading_time: 3,
              published_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'related-2',
              title: 'Practical Guide to Supabase Authentication & RLS',
              slug: 'supabase-auth-and-rls',
              excerpt:
                'Secure your database tables with declarative Row Level Security policies and modern JWT authentication.',
              content: '',
              cover_image_url:
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
              category: 'Database',
              tags: ['Supabase', 'Security', 'PostgreSQL'],
              status: 'published',
              featured: false,
              reading_time: 5,
              published_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          setLoading(false);
        }
        return;
      }

      // Live Supabase lookup
      try {
        if (!isSupabaseConfigured()) {
          // Supabase is not configured yet with valid credentials -> post not found
          if (isMounted) {
            setPost(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (isMounted) {
          if (error || !data) {
            setPost(null);
          } else {
            setPost(data);

            // Fetch related posts (same category or featured, excluding current)
            try {
              const { data: related } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .neq('id', data.id)
                .order('created_at', { ascending: false })
                .limit(3);

              if (isMounted && related) {
                setRelatedPosts(related);
              }
            } catch {
              // Silently ignore related posts fetch failure
            }
          }
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        if (isMounted) {
          setPost(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [slug, searchParams]);

  // Social share helpers
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const handleTwitterShare = () => {
    if (!post) return;
    const shareText = encodeURIComponent(`${post.title} by Subhasish Dev Adhikary`);
    const shareUrl = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    if (!post) return;
    const shareUrl = encodeURIComponent(currentUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: currentUrl,
        });
      } catch {
        // User cancelled share or unsupported
      }
    }
  };

  // ReactMarkdown components map for rich prose typography
  const markdownComponents: Components = useMemo(
    () => ({
      pre({ children }) {
        return <CodeBlock>{children}</CodeBlock>;
      },
      code({ className, children, ...props }) {
        const hasLang = /language-(\w+)/.test(className || '');
        if (!hasLang) {
          return (
            <code
              className="px-1.5 py-0.5 rounded text-sm font-mono bg-surface-900 text-primary-300 border border-surface-800 font-normal"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      h1({ children }) {
        return (
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white mt-12 mb-6 pb-3 border-b border-surface-800 tracking-tight">
            {children}
          </h1>
        );
      },
      h2({ children }) {
        return (
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-white mt-10 mb-4 pb-2 border-b border-surface-800/80 tracking-tight">
            {children}
          </h2>
        );
      },
      h3({ children }) {
        return (
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold font-display text-surface-100 mt-8 mb-3 tracking-tight">
            {children}
          </h3>
        );
      },
      h4({ children }) {
        return (
          <h4 className="text-base sm:text-lg font-semibold font-display text-surface-200 mt-6 mb-2">
            {children}
          </h4>
        );
      },
      p({ children }) {
        return (
          <p className="text-surface-300 text-base sm:text-lg leading-relaxed mb-6 font-normal">
            {children}
          </p>
        );
      },
      ul({ children }) {
        return (
          <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-surface-300 text-base sm:text-lg marker:text-primary-400">
            {children}
          </ul>
        );
      },
      ol({ children }) {
        return (
          <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 text-surface-300 text-base sm:text-lg marker:text-primary-400 font-medium">
            {children}
          </ol>
        );
      },
      li({ children }) {
        return <li className="leading-relaxed pl-1 font-normal">{children}</li>;
      },
      blockquote({ children }) {
        return (
          <blockquote className="my-8 border-l-4 border-primary-500 bg-primary-500/10 px-6 py-4 rounded-r-xl italic text-surface-200 shadow-sm border-opacity-90">
            {children}
          </blockquote>
        );
      },
      a({ href, children }) {
        const isExternal = href?.startsWith('http');
        return (
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-primary-400 hover:text-primary-300 font-medium underline underline-offset-4 decoration-primary-500/40 hover:decoration-primary-400 transition-colors inline-flex items-center gap-1"
          >
            {children}
            {isExternal && <ExternalLink className="w-3.5 h-3.5 inline-block opacity-70" />}
          </a>
        );
      },
      strong({ children }) {
        return <strong className="font-semibold text-white">{children}</strong>;
      },
      em({ children }) {
        return <em className="italic text-surface-200">{children}</em>;
      },
      table({ children }) {
        return (
          <div className="my-8 overflow-x-auto rounded-xl border border-surface-800 shadow-lg">
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              {children}
            </table>
          </div>
        );
      },
      thead({ children }) {
        return (
          <thead className="bg-surface-900 border-b border-surface-800 text-surface-200">
            {children}
          </thead>
        );
      },
      th({ children }) {
        return (
          <th className="px-4 py-3 font-semibold border-r border-surface-800 last:border-r-0">
            {children}
          </th>
        );
      },
      tbody({ children }) {
        return (
          <tbody className="divide-y divide-surface-800/60 bg-surface-950/40">
            {children}
          </tbody>
        );
      },
      tr({ children }) {
        return <tr className="hover:bg-surface-900/40 transition-colors">{children}</tr>;
      },
      td({ children }) {
        return (
          <td className="px-4 py-3 text-surface-300 border-r border-surface-800 last:border-r-0">
            {children}
          </td>
        );
      },
      hr() {
        return (
          <hr className="border-0 h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent my-10" />
        );
      },
      img({ src, alt }) {
        return (
          <figure className="my-8">
            <img
              src={src}
              alt={alt || ''}
              className="w-full rounded-2xl border border-surface-800 shadow-xl object-cover max-h-[500px]"
              loading="lazy"
            />
            {alt && (
              <figcaption className="text-center text-xs text-surface-500 mt-2.5 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      },
    }),
    []
  );

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 text-surface-200 py-12 sm:py-20">
        <Helmet>
          <title>{t('common.loading', 'Loading article...')} | Subhasish Dev Adhikary</title>
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-4 w-40 bg-surface-800 rounded" />
          <div className="h-6 w-24 bg-surface-800 rounded-full" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-surface-800 rounded-lg" />
            <div className="h-10 w-3/4 bg-surface-800 rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-surface-800 rounded" />
              <div className="h-3 w-24 bg-surface-800 rounded" />
            </div>
          </div>
          <div className="w-full aspect-video bg-surface-800 rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-full bg-surface-800 rounded" />
            <div className="h-4 w-5/6 bg-surface-800 rounded" />
            <div className="h-4 w-4/6 bg-surface-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Post Not Found State (default when no posts exist yet)
  if (!post) {
    return (
      <div className="min-h-[85vh] bg-surface-950 text-surface-200 flex items-center justify-center py-16 px-4">
        <Helmet>
          <title>{t('blog.postNotFound', 'Post Not Found')} | Subhasish Dev Adhikary</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta
            name="description"
            content="The requested blog post could not be found or has not been published yet."
          />
        </Helmet>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full mx-auto"
        >
          {/* Back to Blog link above card */}
          <div className="mb-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-surface-400 hover:text-primary-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>{t('blog.backToBlog', 'Back to Blog')}</span>
            </Link>
          </div>

          <div className="relative rounded-2xl p-8 sm:p-10 bg-surface-900/60 border border-surface-800/80 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Icon */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-800/90 border border-surface-700/80 flex items-center justify-center mb-6 shadow-inner">
              <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
            </div>

            {/* Status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-surface-800 text-surface-400 border border-surface-700 mb-4">
              <span>404 • Not Found</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-3 tracking-tight">
              {t('blog.postNotFound', 'Post not found')}
            </h1>

            <p className="text-surface-300 text-sm sm:text-base leading-relaxed mb-4 max-w-md mx-auto">
              {t(
                'blog.postNotFoundDesc',
                "The article you're looking for doesn't exist yet or has been moved."
              )}
            </p>

            {slug && (
              <div className="inline-block px-3 py-1.5 rounded-lg bg-surface-950/80 border border-surface-800 text-xs font-mono text-primary-300 mb-8 max-w-full truncate">
                slug: {slug}
              </div>
            )}

            <p className="text-xs text-surface-500 mb-8 max-w-sm mx-auto">
              Articles are synchronized with Supabase. Once published via the admin dashboard,
              they will be displayed here automatically.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/blog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-medium text-sm transition-all shadow-lg shadow-primary-500/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t('blog.viewAll', 'View All Articles')}</span>
              </Link>

              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white font-medium text-sm border border-surface-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>{t('nav.home', 'Home')}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Post Exists: Full Article Page Layout
  const authorName = 'Subhasish Dev Adhikary';
  const authorRole = 'AI & Web Application Developer';
  const readingTime = post.reading_time || calculateReadingTime(post.content);
  const formattedDate = post.published_at
    ? formatDate(post.published_at, i18n.language)
    : formatDate(post.created_at, i18n.language);

  return (
    <article className="min-h-screen bg-surface-950 text-surface-200 py-10 sm:py-16 selection:bg-primary-500/30 selection:text-white">
      {/* Helmet SEO & Social Meta Tags */}
      <Helmet>
        <title>{`${post.title} | ${authorName}`}</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={authorName} />
        <link rel="canonical" href={currentUrl} />

        {/* OpenGraph */}
        <meta property="og:site_name" content="Subhasish Dev Adhikary Portfolio" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={currentUrl} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        <meta property="article:author" content={authorName} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.cover_image_url && <meta name="twitter:image" content={post.cover_image_url} />}
      </Helmet>

      {/* Main Centered Reading Layout (max-w-3xl) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Navigation & Breadcrumb Header */}
        <motion.div variants={itemVariants} className="space-y-4 mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-surface-400 hover:text-primary-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t('blog.backToBlog', 'Back to Blog')}</span>
          </Link>

          {/* Breadcrumb: Home > Blog > {Post Title} */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center space-x-2 text-xs sm:text-sm text-surface-400 overflow-hidden text-ellipsis whitespace-nowrap pt-1"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-primary-400 transition-colors flex-shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('nav.home', 'Home')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-surface-600 flex-shrink-0" />
            <Link
              to="/blog"
              className="hover:text-primary-400 transition-colors flex-shrink-0"
            >
              <span>{t('nav.blog', 'Blog')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-surface-600 flex-shrink-0" />
            <span
              className="text-surface-300 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md"
              aria-current="page"
            >
              {post.title}
            </span>
          </nav>
        </motion.div>

        {/* Article Header */}
        <motion.header variants={itemVariants} className="mb-10">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-sm">
              <Sparkles className="w-3 h-3 text-primary-400" />
              {post.category}
            </span>
          </div>

          {/* Large Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-6 leading-[1.18]">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-surface-300 font-normal leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          {/* Author & Publication Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-surface-800 text-sm">
            <div className="flex items-center gap-3">
              {/* Author Avatar / Badge */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 p-[2px] flex-shrink-0 shadow-md">
                <div className="w-full h-full rounded-full bg-surface-950 flex items-center justify-center text-primary-300 font-bold text-sm">
                  SD
                </div>
              </div>
              <div>
                <div className="font-semibold text-white text-sm sm:text-base flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary-400 sm:hidden" />
                  <span>{authorName}</span>
                </div>
                <div className="text-xs text-surface-400">{authorRole}</div>
              </div>
            </div>

            {/* Date and Reading Time */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-surface-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-400" />
                <time dateTime={post.published_at || post.created_at}>{formattedDate}</time>
              </div>
              <span className="text-surface-700">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-400" />
                <span>
                  {readingTime} {t('blog.minRead', 'min read')}
                </span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Cover Image (Full Width within max-w-3xl) */}
        {post.cover_image_url && (
          <motion.div
            variants={itemVariants}
            className="relative rounded-2xl overflow-hidden mb-12 border border-surface-800 shadow-2xl bg-surface-900 aspect-video max-h-[460px] w-full"
          >
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>
        )}

        {/* Article Content Rendered with ReactMarkdown */}
        <motion.div variants={itemVariants} className="prose-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Tags at Bottom */}
        {post.tags && post.tags.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="pt-8 pb-4 border-t border-surface-800 mt-12"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-surface-400 mr-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary-400" />
                {t('blog.tags', 'Tags')}:
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-surface-900 text-surface-300 border border-surface-800 hover:border-primary-500/50 hover:text-primary-300 transition-colors shadow-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Buttons (Copy link, Twitter, LinkedIn) */}
        <motion.div
          variants={itemVariants}
          className="my-8 p-5 sm:p-6 rounded-2xl bg-surface-900/60 border border-surface-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Share2 className="w-4 h-4 text-primary-400" />
            <span>{t('blog.shareArticle', 'Share this article')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              type="button"
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    {t('blog.linkCopied', 'Copied!')}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-surface-400" />
                  <span>{t('blog.copyLink', 'Copy link')}</span>
                </>
              )}
            </button>

            {/* Twitter / X */}
            <button
              onClick={handleTwitterShare}
              type="button"
              aria-label="Share on X / Twitter"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700/80 transition-colors"
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              <span>X (Twitter)</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleLinkedInShare}
              type="button"
              aria-label="Share on LinkedIn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700/80 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              <span>LinkedIn</span>
            </button>

            {/* Native Web Share API if available */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                type="button"
                aria-label="Share article via system dialog"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700/80 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Author Bio Card */}
        <motion.div
          variants={itemVariants}
          className="my-10 p-6 rounded-2xl bg-gradient-to-br from-surface-900 to-surface-950 border border-surface-800 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 via-accent-600 to-electric-light p-[2px] flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-surface-950 flex items-center justify-center text-primary-300 font-bold text-xl">
                SD
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-1">
                {t('blog.author', 'Author')}
              </div>
              <h3 className="text-lg font-bold font-display text-white mb-1.5">{authorName}</h3>
              <p className="text-surface-300 text-sm leading-relaxed mb-3">
                Self-taught AI & Web Application Developer from West Bengal, India. Passionate
                about building intelligent software products, responsive interfaces, workflow
                automations, and interactive web tools.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-surface-400">
                <Link to="/#about" className="hover:text-primary-400 transition-colors">
                  {t('nav.about', 'About Me')}
                </Link>
                <span>•</span>
                <Link to="/#contact" className="hover:text-primary-400 transition-colors">
                  {t('nav.contact', 'Get in Touch')}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.section variants={itemVariants} className="mt-16 pt-10 border-t border-surface-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {t('blog.relatedArticles', 'Related Articles')}
                </h2>
              </div>
              <Link
                to="/blog"
                className="text-xs sm:text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-1"
              >
                <span>{t('blog.viewAll', 'View All')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group rounded-2xl overflow-hidden bg-surface-900/60 border border-surface-800/80 hover:border-primary-500/50 transition-all duration-300 card-hover flex flex-col shadow-lg"
                >
                  {related.cover_image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-surface-950">
                      <img
                        src={related.cover_image_url}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-500/20">
                          {related.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-surface-400 text-xs line-clamp-2 leading-relaxed mb-4">
                          {related.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-surface-500 pt-3 border-t border-surface-800/60">
                      <span>
                        {related.published_at
                          ? formatDate(related.published_at, i18n.language)
                          : formatDate(related.created_at, i18n.language)}
                      </span>
                      <span>
                        {related.reading_time || calculateReadingTime(related.content)}{' '}
                        {t('blog.minRead', 'min read')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Back to Blog Bottom Navigation */}
        <motion.div variants={itemVariants} className="mt-14 pt-8 border-t border-surface-800 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-900 hover:bg-surface-800 text-surface-200 hover:text-white border border-surface-700/80 transition-all shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm">{t('blog.backToBlog', 'Back to Blog')}</span>
          </Link>
        </motion.div>
      </motion.div>
    </article>
  );
};

export default BlogPost;
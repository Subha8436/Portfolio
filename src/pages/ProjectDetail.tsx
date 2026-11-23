import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  Image as ImageIcon,
  Home,
  ChevronRight,
  Info,
  Target,
  ShieldCheck,
  Cpu,
  Calendar,
  Share2,
  Check,
  Activity,
  FileText,
  Clock,
  Compass,
} from 'lucide-react';

// GitHub Brand Icon SVG component
function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Project Interface definition
export interface FeatureItem {
  title: string;
  description: string;
}

export interface ArchitectureItem {
  label: string;
  value: string;
}

export interface ProjectDetailData {
  slug: string;
  title: string;
  desc: string;
  fullDesc: string;
  purpose: string;
  problem: string;
  solution: string;
  techs: string[];
  category: string;
  year: string;
  status: string;
  features: FeatureItem[];
  architectureHighlights: ArchitectureItem[];
  accentGradient: string;
  heroGradient: string;
  badgeClass: string;
  liveDemoUrl: string;
  githubUrl: string;
}

// Hardcoded project dataset (matching ProjectsSection)
export const PROJECTS_DATA: ProjectDetailData[] = [
  {
    slug: 'davacheck',
    title: 'DavaCheck',
    desc: 'A medicine-awareness project focused on information about potentially fake medicines.',
    fullDesc:
      'DavaCheck is a comprehensive medicine-awareness and pharmaceutical verification web platform developed to empower consumers, patients, and healthcare facilitators with critical information about potentially fake, adulterated, or expired medications.\n\nIn many regions, counterfeit pharmaceuticals present a grave and hidden threat to public health. DavaCheck serves as an accessible digital safety frontline. Through an intuitive, mobile-friendly interface, users can cross-reference drug packaging indicators, verify regulatory batch announcements, learn how to identify visual discrepancies in holograms and typography, and access official guidance on reporting fraudulent products directly to health authorities.',
    purpose:
      'The core purpose of DavaCheck is to democratize pharmaceutical verification knowledge. By translating complex drug packaging regulations and manufacturer security bulletins into simple visual inspection checklists, DavaCheck enables everyday consumers to verify medicine authenticity before consumption.',
    problem:
      'According to the World Health Organization, falsified medicines cause thousands of preventable deaths and treatment failures every year. Everyday patients, rural clinics, and local pharmacies often lack fast, reliable, and accessible verification tools to confirm packaging integrity, check batch numbers, or identify counterfeit discrepancies.',
    solution:
      'DavaCheck provides an educational verification portal with batch inspection guidelines, packaging security indicators, discrepancy reporting, and direct links to drug enforcement authorities.',
    techs: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    category: 'Healthcare & Public Safety',
    year: '2024',
    status: 'Completed',
    features: [
      {
        title: 'Batch & Serial Verification Guide',
        description:
          'Structured inspection workflows to examine medicine batch numbers, expiration formats, and manufacturer barcodes against standard regulatory conventions.',
      },
      {
        title: 'Packaging Discrepancy Spotter',
        description:
          'Visual guides and comparison checklists highlighting telltale flaws in counterfeit blister packs, tamper-evident seals, font anomalies, and substandard print quality.',
      },
      {
        title: 'Regulatory Alert Repository',
        description:
          'Curated and indexed repository of recent drug recalls, counterfeit alerts, and official safety bulletins published by national health authorities.',
      },
      {
        title: 'Confidential Incident Reporting',
        description:
          'Secure incident submission form allowing citizens to report suspected fake medicines, upload packaging photos, and route details to consumer protection agencies.',
      },
      {
        title: 'Offline-Ready Safety Checklists',
        description:
          'Lightweight, responsive pages designed for fast caching and effortless access in remote clinics and regions with intermittent mobile connectivity.',
      },
      {
        title: 'Pharmaceutical Literacy Articles',
        description:
          'Educational guides explaining active pharmaceutical ingredients (APIs), generic equivalents, safe medicine storage, and online pharmacy verification.',
      },
    ],
    architectureHighlights: [
      { label: 'Backend Architecture', value: 'Flask (Python 3) RESTful microservice' },
      { label: 'Frontend Engine', value: 'Semantic HTML5, CSS3 Tokens, Vanilla JS ES6+' },
      { label: 'Data Registry', value: 'Relational database schema for drug advisories' },
      { label: 'Security & Integrity', value: 'Content Security Policy & HTTPS encryption' },
    ],
    accentGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    heroGradient: 'from-emerald-950/60 via-teal-950/30 to-surface-950',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    slug: 'mealmind-ai',
    title: 'MealMind AI',
    desc: 'An AI-powered meal-planning and grocery-budgeting project.',
    fullDesc:
      'MealMind AI is an intelligent culinary planning and grocery budget optimization assistant powered by the Google Gemini API. Designed to eliminate the weekly cognitive burden of meal preparation and household grocery overspending, MealMind AI dynamically evaluates dietary restrictions, household size, caloric targets, and budget caps to generate fully personalized, nutritionally balanced 7-day culinary roadmaps.\n\nBeyond generating creative recipes tailored to existing pantry items, the platform aggregates all necessary ingredients into organized supermarket checklists grouped by grocery aisle, provides real-time ingredient cost estimations, and recommends intelligent substitutions to prevent domestic food waste while keeping meals healthy and delicious.',
    purpose:
      'MealMind AI was built to solve the intertwined dilemmas of household food waste, decision paralysis around nutritious cooking, and escalating grocery inflation. By leveraging generative AI and practical budgeting heuristics, it delivers an effortless system for households to eat healthier while staying strictly within their financial means.',
    problem:
      'Planning a full week of wholesome meals that respect individual dietary preferences, allergen restrictions, and tight budgets takes hours of research. Without proper planning, households frequently overspend on random ingredients, only to discard expensive perishables at the end of the week.',
    solution:
      'MealMind AI pairs Google Gemini LLM intelligence with an intuitive budget optimization engine that automatically converts pantry inventory and budget targets into structured weekly menus and aisle-sorted shopping lists.',
    techs: ['Python', 'Flask', 'Google Gemini API', 'JavaScript'],
    category: 'AI & Household FinTech',
    year: '2024',
    status: 'Active Development',
    features: [
      {
        title: 'Gemini-Powered Recipe Synthesis',
        description:
          'Synthesizes tailored breakfast, lunch, and dinner recipes tailored precisely to user macronutrient goals, taste preferences, and food allergies.',
      },
      {
        title: 'Dynamic Grocery Budget Estimator',
        description:
          'Projects estimated shopping cart costs and automatically proposes budget-friendly ingredient alternatives to stay under defined spending limits.',
      },
      {
        title: 'Aisle-Sorted Shopping Lists',
        description:
          'Automatically consolidates ingredients across all planned meals into clean, checkable shopping lists categorized by supermarket department.',
      },
      {
        title: 'Zero-Waste Pantry Inventory Tracker',
        description:
          'Tracks in-home pantry staples to prioritize recipes that utilize expiring perishable ingredients before recommending new grocery purchases.',
      },
      {
        title: 'Dietary Constraint Profiles',
        description:
          'Comprehensive profiles for Vegetarian, Vegan, Keto, Diabetic-friendly, Gluten-Free, Halal, Low-FODMAP, and allergy-sensitive regimens.',
      },
      {
        title: 'Step-by-Step Cooking Assistant',
        description:
          'Interactive kitchen-friendly view offering portion scaling, preparation timers, and clear step-by-step culinary directions.',
      },
    ],
    architectureHighlights: [
      { label: 'Generative AI', value: 'Google Gemini Pro / Flash API integration' },
      { label: 'Backend Server', value: 'Python Flask API with prompt orchestration' },
      { label: 'Frontend Client', value: 'Responsive asynchronous JavaScript UI' },
      { label: 'Budget Heuristics', value: 'Custom price estimation and unit converter' },
    ],
    accentGradient: 'from-purple-500 via-indigo-500 to-pink-500',
    heroGradient: 'from-purple-950/60 via-indigo-950/30 to-surface-950',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    slug: 'weathergod',
    title: 'WeatherGod',
    desc: 'A weather application providing real-time weather information.',
    fullDesc:
      'WeatherGod is a modern, high-performance weather intelligence web application that delivers real-time meteorological observations, hourly micro-forecasts, and multi-day synoptic projections in a responsive visual interface. Interfacing directly with precision Weather APIs, WeatherGod offers instant visibility into temperatures, real-feel thermal indices, atmospheric barometric pressure, wind trajectory, humidity percentages, UV indices, and air quality metrics.\n\nThe application features reactive visual design elements that dynamically adjust background gradients, celestial icons, and subtle atmospheric animations based on the queried location’s real-time sky conditions and solar position—giving users an intuitive, atmospheric preview at a glance.',
    purpose:
      'The purpose of WeatherGod is to deliver an elegant, fast, and completely distraction-free weather tracking experience that highlights the environmental variables users care most about without ads, heavy analytics trackers, or convoluted menus.',
    problem:
      'Popular commercial weather portals are overcrowded with intrusive banner ads, video auto-plays, and sponsored sensationalist headlines that slow page loads and obscure essential meteorological forecasts and safety warnings.',
    solution:
      'WeatherGod strips away commercial bloat, focusing strictly on high-speed data fetching, crisp typography, intuitive visual metrics, and proactive environmental health warnings like UV Index and Air Quality Index (AQI).',
    techs: ['JavaScript', 'HTML', 'CSS', 'Weather API'],
    category: 'Utility & Meteorology',
    year: '2024',
    status: 'Completed',
    features: [
      {
        title: 'Hyperlocal Real-Time Conditions',
        description:
          'Instant ambient temperature, "feels like" thermal calculation, humidity percentages, dew point, and barometric trends.',
      },
      {
        title: 'Hourly & 7-Day Forecast Curves',
        description:
          'Interactive trend timelines visualizing hourly temperature progressions, precipitation probabilities, and wind shifts.',
      },
      {
        title: 'Air Quality (AQI) & UV Radiation Index',
        description:
          'Clear health advisories regarding airborne particulate matter and necessary sun safety recommendations.',
      },
      {
        title: 'Context-Aware Dynamic Themes',
        description:
          'Color palettes and atmospheric animations that adapt seamlessly to reflect current sky conditions, dawn, dusk, and night.',
      },
      {
        title: 'Global Search & Geolocation Auto-Detect',
        description:
          'Instant city search with fuzzy autocomplete and one-click device geolocation coordinates detection.',
      },
      {
        title: 'Offline Storage & Fast Caching',
        description:
          'Saves previous queries to browser local storage for instantaneous access during offline or low-bandwidth travel.',
      },
    ],
    architectureHighlights: [
      { label: 'Data Source', value: 'High-precision REST Weather & Geocoding API' },
      { label: 'Core Architecture', value: 'Vanilla JavaScript ES6+ with modular controllers' },
      { label: 'Styling & Layout', value: 'Custom Responsive CSS with Flexbox & CSS Grid' },
      { label: 'Performance', value: 'Sub-second initial paint with client-side caching' },
    ],
    accentGradient: 'from-blue-500 via-cyan-500 to-indigo-500',
    heroGradient: 'from-blue-950/60 via-cyan-950/30 to-surface-950',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
  {
    slug: 'dotkart',
    title: 'DotKart',
    desc: 'An e-commerce and affiliate-shopping project.',
    fullDesc:
      'DotKart is an e-commerce storefront and curated affiliate shopping portal engineered for lightning-fast product discovery, streamlined transactional ergonomics, and transparent affiliate partner recommendations. Built to demonstrate high-efficiency digital merchandising, DotKart pairs a robust Python/Flask routing backend with an interactive client-side shopping cart and instant catalog filtering.\n\nThe storefront emphasizes frictionless consumer exploration with instantaneous search, multi-faceted category filtering, clear discount indicators, and reliable outbound affiliate referral tracking that connects shoppers to vetted merchant platforms.',
    purpose:
      'DotKart was engineered to demonstrate that high-converting affiliate e-commerce does not need heavy, sluggish platforms. It provides a lightweight, clean, and blazingly fast digital storefront focused on curated value, reliable redirects, and consumer trust.',
    problem:
      'Many affiliate shopping websites feel scammy, slow, and confusing to navigate, displaying broken affiliate links, outdated pricing, and cluttered pages loaded with pop-ups that irritate shoppers.',
    solution:
      'DotKart delivers a fast, transparent e-commerce shopping experience with instant client-side filtering, verified affiliate attribution pipelines, smooth cart management, and crisp product showcases.',
    techs: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    category: 'E-Commerce & Digital Commerce',
    year: '2024',
    status: 'Completed',
    features: [
      {
        title: 'Curated Product Catalog & Deals',
        description:
          'Rich product cards with multi-angle image previews, customer review ratings, stock status badges, and discount calculations.',
      },
      {
        title: 'Affiliate Tracking & Outbound Redirection',
        description:
          'Automated affiliate tag attachment and secure redirect routing to verified merchant store partners.',
      },
      {
        title: 'Reactive Client-Side Shopping Cart',
        description:
          'Persistent cart state with instant quantity adjustments, promo code simulation, and live tax/shipping recalculation.',
      },
      {
        title: 'Instant Multi-Facet Search & Filter',
        description:
          'Fast filtering by price brackets, brand, star ratings, and product tags without full page reloads.',
      },
      {
        title: 'Mobile-First Ergonomic Layout',
        description:
          'Designed specifically for thumb-friendly mobile navigation with smooth sliding drawers and floating checkout triggers.',
      },
      {
        title: 'Catalog Management System',
        description:
          'Admin endpoints for managing inventory, adjusting affiliate commissions, and featuring seasonal promotional banners.',
      },
    ],
    architectureHighlights: [
      { label: 'Backend Service', value: 'Python Flask with REST API endpoints' },
      { label: 'Frontend', value: 'HTML5, CSS3 with modern design tokens, JavaScript ES6+' },
      { label: 'Cart State', value: 'Reactive client-side storage with localStorage sync' },
      { label: 'Affiliate Engine', value: 'Clean redirect tracking and UTM attribution' },
    ],
    accentGradient: 'from-amber-500 via-orange-500 to-rose-500',
    heroGradient: 'from-amber-950/60 via-orange-950/30 to-surface-950',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    liveDemoUrl: '#',
    githubUrl: '#',
  },
];

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] },
  },
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [copiedLink, setCopiedLink] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Find project by slug
  const project = PROJECTS_DATA.find((p) => p.slug.toLowerCase() === slug?.toLowerCase());

  // Related projects (the other 3)
  const relatedProjects = PROJECTS_DATA.filter(
    (p) => p.slug.toLowerCase() !== slug?.toLowerCase()
  );

  // Handle share / copy link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle placeholder URL clicks
  const handlePlaceholderClick = (e: React.MouseEvent, type: 'demo' | 'github') => {
    e.preventDefault();
    const label = type === 'demo' ? 'Live Demo' : 'GitHub Repository';
    setNotificationMsg(
      `${label} uses a placeholder link (#). The production link will be published upon public release.`
    );
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // If not found, render 404 state
  if (!project) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
        <Helmet>
          <title>{`${t('common.notFound', 'Page Not Found')} | Subhasish Portfolio`}</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full text-center p-8 sm:p-10 rounded-2xl glass border border-surface-800 bg-surface-900/60 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-2 inline-block">
            404 Error
          </span>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            {t('common.notFound', 'Project Not Found')}
          </h1>

          <p className="text-surface-400 text-sm sm:text-base leading-relaxed mb-8">
            {t(
              'common.notFoundDesc',
              "The project you're looking for doesn't exist or has been relocated."
            )}
            {slug && (
              <span className="block mt-2 font-mono text-xs text-primary-400">
                Requested identifier: "{slug}"
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link to="/" className="btn-primary w-full sm:w-auto">
              <Home className="w-4 h-4" />
              <span>{t('nav.home', 'Back to Home')}</span>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back', 'Go Back')}</span>
            </button>
          </div>

          {/* Quick links to existing projects */}
          <div className="border-t border-surface-800/80 pt-6 text-left">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Explore Available Projects:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROJECTS_DATA.map((p) => (
                <Link
                  key={p.slug}
                  to={`/projects/${p.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-950/60 hover:bg-surface-800/60 border border-surface-800 hover:border-primary-500/40 transition-all text-xs font-medium text-surface-300 hover:text-white group"
                >
                  <span className="truncate">{p.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-500 group-hover:text-primary-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate read time roughly
  const estimatedReadTime = Math.max(2, Math.ceil(project.fullDesc.split(/\s+/).length / 100));

  return (
    <div className="min-h-screen text-surface-200">
      {/* Helmet Meta Tags */}
      <Helmet>
        <title>{`${project.title} | Subhasish Dev Adhikary - Project Details`}</title>
        <meta name="description" content={project.desc} />
        <meta
          name="keywords"
          content={`${project.title}, ${project.techs.join(', ')}, portfolio, developer, web project`}
        />
        <meta property="og:title" content={`${project.title} - ${project.desc}`} />
        <meta property="og:description" content={project.desc} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} | Subhasish Portfolio`} />
        <meta name="twitter:description" content={project.desc} />
      </Helmet>

      {/* Floating Notification Banner */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] px-4 py-3 rounded-xl bg-surface-900/95 border border-primary-500/30 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs sm:text-sm"
          >
            <Info className="w-4 h-4 text-primary-400 shrink-0" />
            <span className="flex-1">{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container-custom py-8 sm:py-12 lg:py-16"
      >
        {/* Top Navigation & Breadcrumbs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          {/* Breadcrumb: Home > Projects > {Project Name} */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-surface-400"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-primary-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('nav.home', 'Home')}</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-surface-600 shrink-0" />
            <Link to="/#projects" className="hover:text-primary-400 transition-colors">
              {t('nav.projects', 'Projects')}
            </Link>
            <ChevronRight className="w-3 h-3 text-surface-600 shrink-0" />
            <span className="text-white font-medium truncate max-w-[180px] sm:max-w-xs">
              {project.title}
            </span>
          </nav>

          {/* Quick Action Controls: Back button & Share */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-white bg-surface-900/70 hover:bg-surface-800 border border-surface-700/60 transition-all cursor-pointer"
              title="Return to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('common.back', 'Back')}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-white bg-surface-900/70 hover:bg-surface-800 border border-surface-700/60 transition-all cursor-pointer"
              title="Share project link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* HERO SECTION */}
        <motion.section
          variants={itemVariants}
          className={`relative rounded-3xl overflow-hidden border border-surface-800/80 bg-gradient-to-b ${project.heroGradient} p-6 sm:p-10 lg:p-12 mb-12 shadow-2xl`}
        >
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            {/* Meta badges row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border ${project.badgeClass}`}
              >
                <Sparkles className="w-3 h-3" />
                {project.category}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-900/80 text-surface-300 border border-surface-700/60">
                <Calendar className="w-3 h-3 text-surface-400" />
                {project.year}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-900/80 text-surface-300 border border-surface-700/60">
                <Activity className="w-3 h-3 text-emerald-400" />
                {project.status}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-900/80 text-surface-400 border border-surface-700/60">
                <Clock className="w-3 h-3 text-surface-400" />
                {estimatedReadTime} min read
              </span>
            </div>

            {/* Project Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] mb-5">
              {project.title}
            </h1>

            {/* Short Tagline / Description */}
            <p className="text-base sm:text-xl text-surface-300 font-normal leading-relaxed max-w-3xl mb-8">
              {project.desc}
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <a
                href={project.liveDemoUrl}
                onClick={(e) => handlePlaceholderClick(e, 'demo')}
                className="btn-primary cursor-pointer shadow-lg shadow-primary-600/20 group"
              >
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>{t('projects.liveDemo', 'Live Demo')}</span>
              </a>

              <a
                href={project.githubUrl}
                onClick={(e) => handlePlaceholderClick(e, 'github')}
                className="btn-secondary cursor-pointer group"
              >
                <GithubIcon className="w-4 h-4 text-surface-300 group-hover:text-white transition-colors" />
                <span>{t('projects.sourceCode', 'GitHub Code')}</span>
              </a>
            </div>

            {/* URL Placeholder Notice */}
            <div className="flex items-start sm:items-center gap-2.5 p-3 rounded-xl bg-surface-950/70 border border-surface-800/80 text-surface-400 text-xs max-w-2xl">
              <Info className="w-4 h-4 text-primary-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Note:</strong> Live Demo and GitHub buttons currently point to placeholder{' '}
                <code className="text-primary-300 font-mono">#</code> URLs and will be connected to
                verified production deployments upon public launch.
              </span>
            </div>
          </div>
        </motion.section>

        {/* MAIN CONTENT GRID (Overview & Purpose in Left/Main Column, Tech Stack & Specs in Right Column) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-16">
          {/* Left / Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* OVERVIEW SECTION */}
            <motion.section
              variants={itemVariants}
              className="p-6 sm:p-8 rounded-2xl glass border border-surface-800 bg-surface-900/40 relative"
            >
              <div className="flex items-center gap-3 mb-5 border-b border-surface-800/80 pb-4">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    {t('projects.overview', 'Overview')}
                  </h2>
                  <p className="text-xs text-surface-400">
                    Comprehensive introduction and project foundation
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-surface-300 text-sm sm:text-base leading-relaxed">
                {project.fullDesc.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-justify sm:text-left">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.section>

            {/* PURPOSE & PROBLEM / SOLUTION SECTION */}
            <motion.section
              variants={itemVariants}
              className="p-6 sm:p-8 rounded-2xl glass border border-surface-800 bg-surface-900/40"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-surface-800/80 pb-4">
                <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    {t('projects.purpose', 'Purpose & Problem Solved')}
                  </h2>
                  <p className="text-xs text-surface-400">
                    Why this project exists and the core challenges addressed
                  </p>
                </div>
              </div>

              {/* Purpose statement */}
              <div className="p-4 sm:p-5 rounded-xl bg-surface-950/60 border border-surface-800 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Mission & Purpose
                </h3>
                <p className="text-sm sm:text-base text-surface-300 leading-relaxed">
                  {project.purpose}
                </p>
              </div>

              {/* Problem vs Solution Split Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-xl bg-rose-950/20 border border-rose-900/30">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>The Challenge / Problem</span>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-300 leading-relaxed">
                    {project.problem}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>The Technical Solution</span>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-300 leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* KEY FEATURES LIST */}
            <motion.section
              variants={itemVariants}
              className="p-6 sm:p-8 rounded-2xl glass border border-surface-800 bg-surface-900/40"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-surface-800/80 pb-4">
                <div className="w-9 h-9 rounded-xl bg-electric-glow/10 border border-electric/30 flex items-center justify-center text-electric-light">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    {t('projects.features', 'Key Features')}
                  </h2>
                  <p className="text-xs text-surface-400">
                    Engineered capabilities and functional highlights
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3 }}
                    className="p-4 rounded-xl bg-surface-950/60 border border-surface-800 hover:border-primary-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1.5">{feature.title}</h4>
                        <p className="text-xs text-surface-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column / Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* TECH STACK SECTION */}
            <motion.section
              variants={itemVariants}
              className="p-6 rounded-2xl glass border border-surface-800 bg-surface-900/40 sticky top-24"
            >
              <div className="flex items-center gap-2.5 mb-5 border-b border-surface-800/80 pb-3.5">
                <Code2 className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-display font-bold text-white">
                  {t('projects.techStack', 'Tech Stack')}
                </h3>
              </div>

              <p className="text-xs text-surface-400 mb-4">
                Technologies and frameworks leveraged across the architecture:
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techs.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface-950 border border-surface-700/80 text-surface-200 hover:border-primary-500/50 hover:text-white transition-all shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {tech}
                  </span>
                ))}
              </div>

              {/* Technical Specifications list */}
              <div className="border-t border-surface-800/80 pt-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                  Architectural Highlights
                </h4>

                <div className="space-y-2.5">
                  {project.architectureHighlights.map((spec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-surface-950/60 border border-surface-850 text-xs"
                    >
                      <span className="block text-surface-400 text-[11px] mb-0.5">
                        {spec.label}
                      </span>
                      <span className="font-medium text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links in Sidebar */}
              <div className="border-t border-surface-800/80 pt-5 mt-6 flex flex-col gap-2.5">
                <a
                  href={project.liveDemoUrl}
                  onClick={(e) => handlePlaceholderClick(e, 'demo')}
                  className="btn-primary w-full text-xs py-2.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live Demo</span>
                </a>

                <a
                  href={project.githubUrl}
                  onClick={(e) => handlePlaceholderClick(e, 'github')}
                  className="btn-secondary w-full text-xs py-2.5 cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Browse Source Code</span>
                </a>
              </div>
            </motion.section>
          </div>
        </div>

        {/* SCREENSHOT GALLERY PLACEHOLDER SECTION */}
        <motion.section
          variants={itemVariants}
          className="p-6 sm:p-10 rounded-3xl glass border border-surface-800 bg-surface-900/30 mb-16"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-surface-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <ImageIcon className="w-4 h-4" />
                <span>Gallery & Previews</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {t('projects.screenshots', 'Screenshots & Interface Preview')}
              </h2>
            </div>
            <p className="text-xs text-surface-400 max-w-sm">
              Visual walkthrough of application states, responsive views, and interactive
              components.
            </p>
          </div>

          {/* Screenshot Placeholders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder 1: Desktop Main Window */}
            <div className="group rounded-2xl overflow-hidden border border-surface-800 bg-surface-950 flex flex-col shadow-lg transition-all duration-300 hover:border-surface-700">
              {/* Mock Browser Header */}
              <div className="px-4 py-2.5 bg-surface-900 border-b border-surface-800 flex items-center justify-between text-xs text-surface-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="px-3 py-0.5 rounded-md bg-surface-950/80 text-[10px] font-mono text-surface-400 truncate max-w-[140px]">
                  https://{project.slug}.dev/app
                </div>
                <div className="w-3" />
              </div>

              {/* Gradient Placeholder Canvas */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-surface-900 via-primary-950/40 to-surface-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Subtle wireframe layout elements */}
                <div className="absolute inset-x-6 top-6 h-3 bg-surface-800/40 rounded-md" />
                <div className="absolute inset-x-6 top-12 bottom-12 flex gap-3 opacity-30 pointer-events-none">
                  <div className="w-1/4 h-full bg-surface-800/40 rounded-lg" />
                  <div className="w-3/4 h-full bg-surface-800/30 rounded-lg flex flex-col gap-2 p-2">
                    <div className="w-full h-8 bg-surface-700/30 rounded" />
                    <div className="w-full flex-1 bg-surface-700/20 rounded" />
                  </div>
                </div>

                {/* Badge Overlay */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-surface-900/90 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-xl mb-3 backdrop-blur-md group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-primary-300 bg-primary-500/10 border border-primary-500/20 backdrop-blur-sm mb-1.5">
                    Screenshots coming soon
                  </span>
                  <p className="text-[11px] text-surface-400">Desktop dashboard & primary flows</p>
                </div>
              </div>

              <div className="p-3.5 bg-surface-950 border-t border-surface-850 flex items-center justify-between text-xs">
                <span className="font-medium text-surface-300">Desktop Layout Overview</span>
                <span className="text-[11px] text-surface-500">1920 × 1080</span>
              </div>
            </div>

            {/* Placeholder 2: Mobile View */}
            <div className="group rounded-2xl overflow-hidden border border-surface-800 bg-surface-950 flex flex-col shadow-lg transition-all duration-300 hover:border-surface-700">
              {/* Mock Mobile Header */}
              <div className="px-4 py-2.5 bg-surface-900 border-b border-surface-800 flex items-center justify-between text-xs text-surface-400">
                <span className="text-[10px] font-mono text-surface-400">Mobile Responsive</span>
                <div className="w-10 h-1.5 rounded-full bg-surface-800" />
                <span className="text-[10px] font-mono text-emerald-400">100%</span>
              </div>

              {/* Gradient Placeholder Canvas */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-surface-900 via-accent-950/40 to-surface-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Mobile mock shape */}
                <div className="absolute inset-y-4 w-28 bg-surface-800/30 rounded-xl border border-surface-700/30 flex flex-col p-2 gap-1.5 opacity-40 pointer-events-none">
                  <div className="w-full h-3 bg-surface-700/40 rounded" />
                  <div className="w-full h-12 bg-surface-700/20 rounded" />
                  <div className="w-full h-12 bg-surface-700/20 rounded" />
                </div>

                {/* Badge Overlay */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-surface-900/90 border border-accent-500/30 flex items-center justify-center text-accent-400 shadow-xl mb-3 backdrop-blur-md group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-accent-300 bg-accent-500/10 border border-accent-500/20 backdrop-blur-sm mb-1.5">
                    Screenshots coming soon
                  </span>
                  <p className="text-[11px] text-surface-400">Mobile handheld viewport</p>
                </div>
              </div>

              <div className="p-3.5 bg-surface-950 border-t border-surface-850 flex items-center justify-between text-xs">
                <span className="font-medium text-surface-300">Responsive Touch Interface</span>
                <span className="text-[11px] text-surface-500">390 × 844</span>
              </div>
            </div>

            {/* Placeholder 3: Analytics / Detail Flow */}
            <div className="group rounded-2xl overflow-hidden border border-surface-800 bg-surface-950 flex flex-col shadow-lg transition-all duration-300 hover:border-surface-700 md:col-span-2 lg:col-span-1">
              {/* Mock Header */}
              <div className="px-4 py-2.5 bg-surface-900 border-b border-surface-800 flex items-center justify-between text-xs text-surface-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-700" />
                </div>
                <div className="px-3 py-0.5 rounded-md bg-surface-950/80 text-[10px] font-mono text-surface-400">
                  Feature Inspection
                </div>
                <div className="w-3" />
              </div>

              {/* Gradient Placeholder Canvas */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-surface-900 via-electric-glow/20 to-surface-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Wireframe metrics */}
                <div className="absolute inset-x-6 top-8 bottom-8 grid grid-cols-2 gap-2 opacity-30 pointer-events-none">
                  <div className="bg-surface-800/40 rounded-lg" />
                  <div className="bg-surface-800/40 rounded-lg" />
                </div>

                {/* Badge Overlay */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-surface-900/90 border border-electric/30 flex items-center justify-center text-electric-light shadow-xl mb-3 backdrop-blur-md group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-electric-light bg-electric/10 border border-electric/20 backdrop-blur-sm mb-1.5">
                    Screenshots coming soon
                  </span>
                  <p className="text-[11px] text-surface-400">Data visualization & workflows</p>
                </div>
              </div>

              <div className="p-3.5 bg-surface-950 border-t border-surface-850 flex items-center justify-between text-xs">
                <span className="font-medium text-surface-300">Feature Drilldown & Results</span>
                <span className="text-[11px] text-surface-500">High-Resolution</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* RELATED PROJECTS SECTION */}
        <motion.section variants={itemVariants} className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>More Portfolio Work</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {t('projects.relatedProjects', 'Related Projects')}
              </h2>
            </div>
            <Link
              to="/#projects"
              className="text-xs font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>{t('projects.viewAll', 'View All Projects')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Related Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((rel) => (
              <motion.div
                key={rel.slug}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl glass border border-surface-800 bg-surface-900/40 p-6 flex flex-col justify-between hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/5 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-primary-400 uppercase tracking-wider">
                      {rel.category.split('&')[0].trim()}
                    </span>
                    <span className="text-[11px] font-mono text-surface-500">{rel.year}</span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {rel.title}
                  </h3>

                  <p className="text-xs text-surface-400 leading-relaxed mb-5 line-clamp-3">
                    {rel.desc}
                  </p>
                </div>

                <div>
                  {/* Tech pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {rel.techs.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-950/90 border border-surface-800 text-surface-400"
                      >
                        {t}
                      </span>
                    ))}
                    {rel.techs.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-950/50 text-surface-500">
                        +{rel.techs.length - 3}
                      </span>
                    )}
                  </div>

                  {/* View Details Link */}
                  <Link
                    to={`/projects/${rel.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white group-hover:text-primary-400 transition-colors"
                  >
                    <span>{t('projects.viewDetails', 'View Project')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

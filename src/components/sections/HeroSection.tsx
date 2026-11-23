import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, ChevronDown, Mail, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy-load ThreeScene to keep the initial bundle lightweight and prevent direct Three.js bundling
const ThreeScene = lazy(() => import('@/components/three/ThreeScene'));

// Octocat GitHub icon component
function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

// Fallback loader for the 3D scene
function ThreeSceneFallback() {
  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex items-center justify-center pointer-events-none select-none">
      <div className="relative flex items-center justify-center">
        {/* Ambient glow sphere */}
        <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-primary-600/20 via-accent-500/20 to-electric-glow/20 blur-3xl animate-pulse-slow" />
        
        {/* Orbital rings */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-primary-500/20 animate-[spin_15s_linear_infinite]" />
        <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-dashed border-accent-400/25 animate-[spin_10s_linear_infinite_reverse]" />
        
        {/* Core pulse */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary-400 animate-ping" />
        </div>
      </div>
    </div>
  );
}

// Background floating particle definitions (CSS-only animation)
const PARTICLES = [
  { top: '10%', left: '8%', size: 'w-1.5 h-1.5', color: 'bg-primary-400', delay: '0s', duration: '6s', blur: false },
  { top: '22%', left: '46%', size: 'w-2 h-2', color: 'bg-accent-400', delay: '1.2s', duration: '7.5s', blur: true },
  { top: '16%', left: '82%', size: 'w-1 h-1', color: 'bg-electric-light', delay: '2.5s', duration: '5.2s', blur: false },
  { top: '38%', left: '16%', size: 'w-2.5 h-2.5', color: 'bg-primary-300', delay: '3.1s', duration: '8.4s', blur: true },
  { top: '50%', left: '90%', size: 'w-1.5 h-1.5', color: 'bg-accent-300', delay: '0.8s', duration: '6.5s', blur: false },
  { top: '68%', left: '7%', size: 'w-2 h-2', color: 'bg-electric', delay: '4s', duration: '9s', blur: true },
  { top: '74%', left: '36%', size: 'w-1 h-1', color: 'bg-primary-400', delay: '1.8s', duration: '5.8s', blur: false },
  { top: '84%', left: '76%', size: 'w-2 h-2', color: 'bg-accent-400', delay: '3.6s', duration: '7.2s', blur: true },
  { top: '30%', left: '94%', size: 'w-1 h-1', color: 'bg-white', delay: '2.2s', duration: '6.8s', blur: false },
  { top: '58%', left: '52%', size: 'w-1.5 h-1.5', color: 'bg-primary-200', delay: '4.5s', duration: '8s', blur: false },
  { top: '88%', left: '20%', size: 'w-2 h-2', color: 'bg-electric-light', delay: '1s', duration: '6.4s', blur: true },
  { top: '8%', left: '62%', size: 'w-1.5 h-1.5', color: 'bg-accent-300', delay: '2.9s', duration: '7.8s', blur: false },
];

export default function HeroSection() {
  const { t } = useTranslation();

  // Smooth scroll helper
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Framer-motion animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#040408] via-[#090b1e] to-[#040409] text-white pt-20 pb-16 md:py-24 lg:py-0"
    >
      {/* 1. Cinematic Background Gradient & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep radial highlights */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-primary-600/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-accent-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[750px] h-[450px] rounded-full bg-electric-glow/15 blur-[130px]" />

        {/* 2. Background Grid Pattern with Radial Mask */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, #000 35%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, #000 35%, transparent 85%)',
          }}
        />

        {/* 3. Subtle Geometric Outlines */}
        <div className="absolute top-24 right-16 w-52 h-52 border border-primary-500/10 rounded-3xl rotate-12 hidden md:block" />
        <div className="absolute bottom-28 left-12 w-40 h-40 border border-accent-500/10 rounded-full hidden md:block" />
        <div className="absolute top-1/2 right-1/4 w-28 h-28 border border-electric/10 rotate-45 hidden lg:block" />

        {/* 4. CSS-only Floating Background Particles */}
        {PARTICLES.map((particle, idx) => (
          <div
            key={idx}
            className={cn(
              'absolute rounded-full pointer-events-none animate-float',
              particle.size,
              particle.color,
              particle.blur ? 'blur-[1px] opacity-60' : 'opacity-40'
            )}
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="container-custom relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-6rem)] lg:min-h-screen py-12 lg:py-0">
          
          {/* Left Column: Animated Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-7 z-10"
          >
            {/* Status Badge: Currently Learning */}
            <motion.div variants={itemVariants} className="mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-950/40">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>{t('hero.status', 'Currently Learning')}</span>
              </div>
            </motion.div>

            {/* Greeting: Hi, I'm */}
            <motion.div variants={itemVariants} className="mb-2 sm:mb-3">
              <span className="inline-block text-base sm:text-lg md:text-xl font-mono text-primary-300 font-semibold tracking-wide">
                {t('hero.greeting', "Hi, I'm")}
              </span>
            </motion.div>

            {/* Name: Subhasish (Very Large, Gradient Text) */}
            <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-none">
                <span className="bg-gradient-to-r from-primary-400 via-accent-300 to-electric-light bg-clip-text text-transparent drop-shadow-sm">
                  {t('hero.name', 'Subhasish')}
                </span>
              </h1>
            </motion.div>

            {/* Title: AI & Web Application Developer (Medium) */}
            <motion.div variants={itemVariants} className="mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-surface-200 tracking-tight">
                {t('hero.title', 'AI & Web Application Developer')}
              </h2>
            </motion.div>

            {/* Subtitle: Self-taught Developer */}
            <motion.div variants={itemVariants} className="mb-8 sm:mb-10 max-w-xl lg:max-w-2xl">
              <p className="text-surface-300 text-sm sm:text-base md:text-lg leading-relaxed text-balance">
                {t(
                  'hero.subtitle',
                  'Self-taught developer passionate about AI-powered applications, modern web technologies, automation, and interactive experiences.'
                )}
              </p>
            </motion.div>

            {/* Actions: CTA Buttons + GitHub & Contact Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto"
            >
              {/* Primary CTA: View My Projects */}
              <button
                type="button"
                onClick={() => handleScrollTo('projects')}
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base text-white bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <span>{t('hero.viewProjects', 'View My Projects')}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* Secondary CTA: Explore My Journey */}
              <button
                type="button"
                onClick={() => handleScrollTo('journey')}
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base text-surface-200 hover:text-white bg-surface-900/60 hover:bg-surface-800/80 border border-surface-700/80 hover:border-primary-400/80 backdrop-blur-md transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-accent-400 group-hover:text-accent-300 transition-colors" />
                <span>{t('hero.exploreJourney', 'Explore My Journey')}</span>
              </button>

              {/* Secondary Group: Contact & GitHub Icon Button */}
              <div className="flex items-center justify-center gap-3 sm:pl-2">
                {/* Contact Button */}
                <button
                  type="button"
                  onClick={() => handleScrollTo('contact')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium text-sm text-surface-300 hover:text-white bg-surface-900/40 hover:bg-surface-800/60 border border-surface-800 hover:border-surface-700 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                  title={t('nav.contact', 'Contact')}
                >
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span className="sm:inline">{t('nav.contact', 'Contact')}</span>
                </button>

                {/* GitHub Icon Button */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-3.5 rounded-xl text-surface-300 hover:text-white bg-surface-900/40 hover:bg-surface-800/60 border border-surface-800 hover:border-surface-700 hover:border-primary-500/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label={t('github.viewProfile', 'View GitHub Profile')}
                  title={t('github.viewProfile', 'View GitHub Profile')}
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: ThreeScene (Desktop: Right Column / Mobile: Behind Text with Opacity) */}
          <div className="absolute inset-0 lg:relative lg:inset-auto z-0 lg:z-10 opacity-30 lg:opacity-100 pointer-events-none lg:pointer-events-auto flex items-center justify-center lg:col-span-5 h-full lg:h-[550px] xl:h-[620px] w-full overflow-hidden">
            <Suspense fallback={<ThreeSceneFallback />}>
              <ThreeScene />
            </Suspense>
          </div>

        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <button
          type="button"
          onClick={() => handleScrollTo('about')}
          className="group flex flex-col items-center gap-1.5 text-surface-400 hover:text-primary-300 transition-colors cursor-pointer select-none focus:outline-none"
          aria-label={t('common.scrollDown', 'Scroll down')}
        >
          <span className="text-[11px] font-mono uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
            {t('common.scrollDown', 'Scroll')}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ChevronDown className="w-5 h-5 text-primary-400 group-hover:text-primary-300 transition-transform duration-200 group-hover:translate-y-0.5" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}

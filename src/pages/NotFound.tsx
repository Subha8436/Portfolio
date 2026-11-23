import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

interface FloatingParticle {
  id: number;
  size: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
  yOffset: number;
}

const PARTICLES: FloatingParticle[] = [
  { id: 1, size: 4, x: '12%', y: '20%', duration: 6, delay: 0, yOffset: -30 },
  { id: 2, size: 6, x: '82%', y: '18%', duration: 7, delay: 0.8, yOffset: -25 },
  { id: 3, size: 5, x: '22%', y: '78%', duration: 5.5, delay: 0.3, yOffset: -35 },
  { id: 4, size: 3, x: '75%', y: '82%', duration: 8, delay: 1.2, yOffset: -20 },
  { id: 5, size: 5, x: '8%', y: '50%', duration: 6.5, delay: 0.5, yOffset: -28 },
  { id: 6, size: 4, x: '90%', y: '45%', duration: 7.2, delay: 1.5, yOffset: -32 },
  { id: 7, size: 3, x: '35%', y: '12%', duration: 6.8, delay: 0.2, yOffset: -22 },
  { id: 8, size: 5, x: '68%', y: '30%', duration: 5.8, delay: 1.0, yOffset: -26 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 260,
    },
  },
};

const numberVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 180,
    },
  },
};

export default function NotFound(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{t('notFound.title', 'Page Not Found')} | Subhasish</title>
        <meta name="title" content={t('notFound.title', 'Page Not Found')} />
        <meta
          name="description"
          content={t(
            'notFound.description',
            "The page you're looking for doesn't exist or has been moved."
          )}
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden selection:bg-primary-500/30 selection:text-white">
        {/* Subtle background ambient glows and geometric shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 overflow-hidden -z-10"
        >
          {/* Radial ambient glow orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-600/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent-600/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-electric/10 blur-[100px]" />

          {/* Floating Geometric Shape 1: Rounded Square */}
          <motion.div
            className="absolute top-[18%] right-[14%] w-20 h-20 rounded-2xl border border-primary-500/20 bg-primary-500/5 backdrop-blur-[2px] hidden sm:block"
            animate={{
              rotate: [0, 90, 180, 270, 360],
              y: [0, -18, 0],
              x: [0, 8, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Floating Geometric Shape 2: Diamond / Tilted Square */}
          <motion.div
            className="absolute bottom-[22%] left-[12%] w-16 h-16 rounded-xl border border-accent-500/20 bg-accent-500/5 hidden sm:block"
            animate={{
              rotate: [45, 135, 225, 315, 405],
              y: [0, 20, 0],
              x: [0, -10, 0],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Floating Geometric Shape 3: Dashed Circle Ring */}
          <motion.div
            className="absolute top-[28%] left-[15%] w-24 h-24 rounded-full border-2 border-dashed border-electric/25 hidden md:block"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.08, 1],
              y: [0, 12, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating Geometric Shape 4: Small Concentric Ring */}
          <motion.div
            className="absolute bottom-[28%] right-[20%] w-14 h-14 rounded-full border border-primary-400/25 bg-surface-900/40 hidden md:block"
            animate={{
              y: [0, -16, 0],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating particles */}
          {PARTICLES.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute rounded-full bg-primary-400/40 dark:bg-primary-300/40"
              style={{
                width: particle.size,
                height: particle.size,
                left: particle.x,
                top: particle.y,
              }}
              animate={{
                y: [0, particle.yOffset, 0],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Centered Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-xl w-full mx-auto flex flex-col items-center text-center"
        >
          {/* Status pill badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wider uppercase bg-primary-500/10 text-primary-400 dark:text-primary-300 border border-primary-500/20 backdrop-blur-md">
              <AlertCircle className="w-3.5 h-3.5 text-primary-400" />
              <span>{t('notFound.subtitle', '404 - Page Not Found')}</span>
            </div>
          </motion.div>

          {/* Large "404" text with gradient and gentle hover/float */}
          <motion.div
            variants={numberVariants}
            className="relative my-2 sm:my-4 select-none"
          >
            {/* Soft backlight behind 404 */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -m-6 sm:-m-10 bg-gradient-to-r from-primary-600/25 via-accent-500/25 to-electric/25 blur-3xl rounded-full opacity-70 pointer-events-none"
            />

            <motion.span
              className="font-display font-extrabold text-8xl sm:text-9xl md:text-[11rem] lg:text-[13rem] leading-none tracking-tighter bg-gradient-to-r from-primary-400 via-accent-400 to-electric-light bg-clip-text text-transparent drop-shadow-2xl inline-block"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              404
            </motion.span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-surface-900 dark:text-white mt-2 mb-3"
          >
            {t('notFound.heading', t('common.notFound', 'Page not found'))}
          </motion.h1>

          {/* Descriptive Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-surface-600 dark:text-surface-400 max-w-md mx-auto leading-relaxed mb-8 px-2"
          >
            {t(
              'notFound.description',
              t(
                'common.notFoundDesc',
                "The page you're looking for doesn't exist, has been moved, or is temporarily unavailable."
              )
            )}
          </motion.p>

          {/* Action Buttons: Go Home & Go Back */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-medium text-sm sm:text-base text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950"
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>{t('notFound.goHome', t('common.goHome', 'Go Home'))}</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-medium text-sm sm:text-base text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-900/60 border border-surface-300 dark:border-surface-700/80 hover:border-primary-500/80 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>{t('notFound.goBack', t('common.back', 'Go Back'))}</span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

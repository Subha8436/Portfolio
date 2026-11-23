import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';
import { ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Project } from '../../types';

export { SectionHeader };

/**
 * Hardcoded project data - to be replaced with Supabase database fetch.
 * Placeholder URLs ('#') are clearly marked and will be updated with production URLs.
 */
export const FEATURED_PROJECTS: Project[] = [
  {
    id: 'proj-davacheck-001',
    title: 'DavaCheck',
    slug: 'davacheck',
    short_description:
      'A medicine-awareness project focused on information about potentially fake medicines.',
    full_description:
      'A medicine-awareness project focused on information about potentially fake medicines, helping users identify authentic pharmaceutical items and understand standard safety standards.',
    technologies: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    thumbnail_url: null,
    gallery_urls: [],
    // Placeholder URL: '#' clearly indicates live deployment URL is pending
    live_url: '#',
    // Placeholder URL: '#' clearly indicates repository URL is pending
    github_url: '#',
    featured: true,
    display_order: 1,
    status: 'published',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'proj-mealmind-002',
    title: 'MealMind AI',
    slug: 'mealmind-ai',
    short_description:
      'An AI-powered meal-planning and grocery-budgeting project.',
    full_description:
      'An intelligent meal-planning and grocery-budgeting application driven by artificial intelligence to optimize pantry resources and meal schedules.',
    technologies: ['Python', 'Flask', 'Google Gemini API', 'JavaScript'],
    thumbnail_url: null,
    gallery_urls: [],
    // Placeholder URL: '#' clearly indicates live deployment URL is pending
    live_url: '#',
    // Placeholder URL: '#' clearly indicates repository URL is pending
    github_url: '#',
    featured: true,
    display_order: 2,
    status: 'published',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
  },
  {
    id: 'proj-weathergod-003',
    title: 'WeatherGod',
    slug: 'weathergod',
    short_description:
      'A weather application providing real-time weather information.',
    full_description:
      'A comprehensive weather application offering real-time forecasts, atmospheric metrics, and intuitive visualization.',
    technologies: ['JavaScript', 'HTML', 'CSS', 'Weather API'],
    thumbnail_url: null,
    gallery_urls: [],
    // Placeholder URL: '#' clearly indicates live deployment URL is pending
    live_url: '#',
    // Placeholder URL: '#' clearly indicates repository URL is pending
    github_url: '#',
    featured: false,
    display_order: 3,
    status: 'published',
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z',
  },
  {
    id: 'proj-dotkart-004',
    title: 'DotKart',
    slug: 'dotkart',
    short_description:
      'An e-commerce and affiliate-shopping project.',
    full_description:
      'An e-commerce and affiliate-shopping platform designed with catalog navigation, product curation, and optimized user checkouts.',
    technologies: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    thumbnail_url: null,
    gallery_urls: [],
    // Placeholder URL: '#' clearly indicates live deployment URL is pending
    live_url: '#',
    // Placeholder URL: '#' clearly indicates repository URL is pending
    github_url: '#',
    featured: false,
    display_order: 4,
    status: 'published',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-01T00:00:00Z',
  },
];

/**
 * Thumbnail gradient palette based on project slug/index.
 */
const PROJECT_GRADIENTS: Record<string, { from: string; via: string; to: string; accent: string }> = {
  davacheck: {
    from: 'from-cyan-900/80',
    via: 'via-blue-800/60',
    to: 'to-indigo-950/90',
    accent: 'text-cyan-400',
  },
  'mealmind-ai': {
    from: 'from-emerald-900/80',
    via: 'via-teal-800/60',
    to: 'to-slate-950/90',
    accent: 'text-emerald-400',
  },
  weathergod: {
    from: 'from-sky-900/80',
    via: 'via-indigo-800/60',
    to: 'to-surface-950/90',
    accent: 'text-sky-400',
  },
  dotkart: {
    from: 'from-amber-900/80',
    via: 'via-orange-800/60',
    to: 'to-rose-950/90',
    accent: 'text-amber-400',
  },
};

/**
 * Framer-motion animation variants for staggered card reveal on scroll.
 */
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
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export interface ProjectsSectionProps {
  projects?: Project[];
  className?: string;
}

export function ProjectsSection({
  projects = FEATURED_PROJECTS,
  className = '',
}: ProjectsSectionProps) {
  const { t } = useTranslation();

  return (
    <section id="projects" className={`section-padding relative overflow-hidden ${className}`}>
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 h-96 w-96 rounded-full bg-accent-600/10 blur-3xl" />
      </div>

      <div className="container-custom">
        {/* Section Header */}
        <SectionHeader
          title={t('projects.sectionTitle', 'Featured Projects')}
          subtitle={t('projects.sectionSubtitle', "Applications I've built")}
        />

        {/* Responsive Grid: 1 col on mobile, 2 cols on desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10"
        >
          {projects.map((project) => {
            const initial = project.title.charAt(0).toUpperCase();
            const gradient =
              PROJECT_GRADIENTS[project.slug] || {
                from: 'from-primary-900/80',
                via: 'via-accent-800/60',
                to: 'to-surface-950/90',
                accent: 'text-primary-400',
              };

            const isLivePlaceholder = !project.live_url || project.live_url === '#';
            const isGithubPlaceholder = !project.github_url || project.github_url === '#';

            return (
              <motion.article
                key={project.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col rounded-2xl bg-surface-900/70 border border-surface-800/80 backdrop-blur-sm overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/30 dark:bg-surface-900/70 dark:border-surface-800/80"
              >
                {/* Top Thumbnail Placeholder */}
                <div
                  className={`relative h-52 sm:h-60 w-full overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} flex items-center justify-center border-b border-surface-800/70`}
                >
                  {/* Subtle Grid and Glow Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30 pointer-events-none" />
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Project Initial Display */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span
                      className={`font-display text-7xl sm:text-8xl font-black tracking-tighter select-none drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 ${gradient.accent}`}
                    >
                      {initial}
                    </span>
                    <span className="mt-1 text-xs font-mono font-medium tracking-widest text-white/60 uppercase">
                      {project.title}
                    </span>
                  </div>

                  {/* "Featured" badge if featured */}
                  {project.featured && (
                    <div className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md shadow-primary-950/50 border border-white/20 backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>{t('projects.featured', 'Featured')}</span>
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col p-6 sm:p-7 justify-between">
                  <div>
                    {/* Project Name */}
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-primary-300 transition-colors">
                      <Link to={`/projects/${project.slug}`} className="focus:outline-none">
                        {project.title}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-surface-400">
                      {project.short_description}
                    </p>

                    {/* Technology Badges */}
                    <div className="mt-5 flex flex-wrap gap-2" aria-label={t('projects.technologies', 'Technologies')}>
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-800/90 text-surface-300 border border-surface-700/60 transition-colors hover:border-primary-500/40 hover:text-white"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-7 pt-5 border-t border-surface-800/80 flex flex-wrap items-center justify-between gap-4">
                    {/* View Details Link */}
                    <Link
                      to={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors group/link focus:outline-none focus:underline"
                    >
                      <span>{t('projects.viewDetails', 'View Details')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>

                    {/* Live Demo & GitHub Action Buttons */}
                    <div className="flex items-center gap-2.5">
                      {/* Live Demo Button */}
                      <a
                        href={project.live_url || '#'}
                        target={!isLivePlaceholder ? '_blank' : undefined}
                        rel={!isLivePlaceholder ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          if (isLivePlaceholder) {
                            e.preventDefault();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800/90 hover:bg-surface-700 text-surface-300 hover:text-white border border-surface-700 transition-colors group/btn"
                        title={
                          isLivePlaceholder
                            ? `${project.title} Live Demo (URL pending - placeholder '#')`
                            : `${project.title} Live Demo`
                        }
                        aria-label={
                          isLivePlaceholder
                            ? `${project.title} Live Demo (URL pending)`
                            : `${project.title} Live Demo`
                        }
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-surface-400 group-hover/btn:text-primary-400 transition-colors" />
                        <span>{t('projects.liveDemo', 'Live Demo')}</span>
                        {isLivePlaceholder && (
                          <span
                            className="text-[10px] text-amber-400/90 font-mono font-bold"
                            title="Placeholder URL (#) - needs real URL"
                          >
                            #
                          </span>
                        )}
                      </a>

                      {/* GitHub Source Code Button */}
                      <a
                        href={project.github_url || '#'}
                        target={!isGithubPlaceholder ? '_blank' : undefined}
                        rel={!isGithubPlaceholder ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          if (isGithubPlaceholder) {
                            e.preventDefault();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800/90 hover:bg-surface-700 text-surface-300 hover:text-white border border-surface-700 transition-colors group/btn"
                        title={
                          isGithubPlaceholder
                            ? `${project.title} GitHub Repository (URL pending - placeholder '#')`
                            : `${project.title} GitHub Repository`
                        }
                        aria-label={
                          isGithubPlaceholder
                            ? `${project.title} GitHub Repository (URL pending)`
                            : `${project.title} GitHub Repository`
                        }
                      >
                        {/* GitHub SVG Icon */}
                        <svg
                          className="w-3.5 h-3.5 text-surface-400 group-hover/btn:text-primary-400 transition-colors fill-current"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          />
                        </svg>
                        <span>{t('projects.sourceCode', 'Source Code')}</span>
                        {isGithubPlaceholder && (
                          <span
                            className="text-[10px] text-amber-400/90 font-mono font-bold"
                            title="Placeholder URL (#) - needs real URL"
                          >
                            #
                          </span>
                        )}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default ProjectsSection;

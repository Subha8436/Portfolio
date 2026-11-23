import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Layout,
  Server,
  Database,
  Sparkles,
  Wrench,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

export interface SkillItem {
  id?: string;
  name: string;
  icon: string | React.ReactNode;
  category: string;
}

export interface SkillCategory {
  id: string;
  translationKey: string;
  defaultTitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderGlow: string;
  gridSpan?: string;
  skills: SkillItem[];
}

export const DEFAULT_SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    translationKey: 'skills.frontend',
    defaultTitle: 'Frontend',
    icon: <Layout className="w-5 h-5" />,
    iconBg: 'bg-primary-500/10 border-primary-500/20',
    iconColor: 'text-primary-400',
    borderGlow: 'group-hover:border-primary-500/40',
    gridSpan: 'md:col-span-1 lg:col-span-1',
    skills: [
      { name: 'HTML5', icon: '🌐', category: 'frontend' },
      { name: 'CSS3', icon: '🎨', category: 'frontend' },
      { name: 'JavaScript', icon: '⚡', category: 'frontend' },
    ],
  },
  {
    id: 'backend',
    translationKey: 'skills.backend',
    defaultTitle: 'Backend',
    icon: <Server className="w-5 h-5" />,
    iconBg: 'bg-accent-500/10 border-accent-500/20',
    iconColor: 'text-accent-400',
    borderGlow: 'group-hover:border-accent-500/40',
    gridSpan: 'md:col-span-1 lg:col-span-1',
    skills: [
      { name: 'Python', icon: '🐍', category: 'backend' },
      { name: 'Flask', icon: '🌶️', category: 'backend' },
    ],
  },
  {
    id: 'database',
    translationKey: 'skills.database',
    defaultTitle: 'Database',
    icon: <Database className="w-5 h-5" />,
    iconBg: 'bg-electric-light/10 border-electric-light/20',
    iconColor: 'text-electric-light',
    borderGlow: 'group-hover:border-electric-light/40',
    gridSpan: 'md:col-span-1 lg:col-span-1',
    skills: [
      { name: 'Supabase', icon: '⚡', category: 'database' },
      { name: 'MySQL', icon: '🐬', category: 'database' },
    ],
  },
  {
    id: 'ai',
    translationKey: 'skills.ai',
    defaultTitle: 'AI & Automation',
    icon: <Sparkles className="w-5 h-5" />,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    borderGlow: 'group-hover:border-amber-500/40',
    gridSpan: 'md:col-span-1 lg:col-span-1',
    skills: [
      { name: 'Google Gemini API', icon: '✨', category: 'ai' },
      { name: 'Prompt Engineering', icon: '🧠', category: 'ai' },
      { name: 'Workflow Automation', icon: '🔄', category: 'ai' },
    ],
  },
  {
    id: 'tools',
    translationKey: 'skills.tools',
    defaultTitle: 'Development & Deployment Tools',
    icon: <Wrench className="w-5 h-5" />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    borderGlow: 'group-hover:border-emerald-500/40',
    gridSpan: 'md:col-span-2 lg:col-span-2',
    skills: [
      { name: 'Git', icon: '🌿', category: 'tools' },
      { name: 'GitHub', icon: '🐙', category: 'tools' },
      { name: 'Termux', icon: '📟', category: 'tools' },
      { name: 'Netlify', icon: '🌐', category: 'tools' },
      { name: 'Vercel', icon: '▲', category: 'tools' },
      { name: 'VS Code', icon: '💻', category: 'tools' },
      { name: 'Google Antigravity', icon: '🚀', category: 'tools' },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export interface SkillsSectionProps {
  id?: string;
  className?: string;
  categories?: SkillCategory[];
}

export function SkillsSection({
  id = 'skills',
  className = '',
  categories = DEFAULT_SKILL_CATEGORIES,
}: SkillsSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      id={id}
      className={`section-padding relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary-500/5 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-accent-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container-custom relative z-10">
        <SectionHeader
          title={t('skills.sectionTitle', 'Skills & Technologies')}
          subtitle={t('skills.sectionSubtitle', 'Technologies I work with')}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {categories.map((category) => {
            const categoryTitle = t(category.translationKey, category.defaultTitle);

            return (
              <motion.div
                key={category.id}
                variants={cardVariants}
                className={`glass rounded-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 group flex flex-col justify-between border border-white/10 dark:border-white/10 light:border-surface-200/80 ${category.borderGlow} ${category.gridSpan || ''}`}
              >
                {/* Subtle top edge glow on card hover */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Category Card Header */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${category.iconBg} ${category.iconColor}`}
                      >
                        {category.icon}
                      </div>
                      <h3 className="text-lg sm:text-xl font-display font-semibold text-white light:text-surface-900 tracking-tight">
                        {categoryTitle}
                      </h3>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface-900/80 dark:bg-surface-900/80 light:bg-surface-200/80 text-surface-400 light:text-surface-600 border border-surface-700/50 dark:border-surface-800 light:border-surface-300/50 select-none">
                      {category.skills.length}
                    </span>
                  </div>

                  {/* Skill Badges / Tags */}
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {category.skills.map((skill) => (
                      <motion.div
                        key={skill.name}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-900/70 dark:bg-surface-900/70 light:bg-white/90 border border-surface-700/60 dark:border-surface-800 light:border-surface-200 text-surface-200 light:text-surface-800 hover:text-white light:hover:text-surface-950 hover:border-primary-500/50 hover:bg-primary-500/15 light:hover:bg-primary-50 hover:shadow-md hover:shadow-primary-500/10 transition-all duration-200 cursor-default select-none group/badge"
                      >
                        <span
                          className="text-base sm:text-lg flex-shrink-0 transition-transform duration-200 group-hover/badge:scale-110 leading-none select-none"
                          role="img"
                          aria-label={skill.name}
                        >
                          {skill.icon}
                        </span>
                        <span className="text-xs sm:text-sm font-medium tracking-wide">
                          {skill.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export { SectionHeader };
export default SkillsSection;

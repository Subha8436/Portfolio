import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Brain,
  Building2,
  User,
  Layout,
  ShoppingCart,
  MessageSquare,
  Workflow,
  Plug,
  Paintbrush,
  Box,
  Cloud,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { cn } from '../../lib/utils';

export interface ServiceItem {
  id: string;
  titleKey: string;
  fallbackTitle: string;
  descKey: string;
  fallbackDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'ai-web',
    titleKey: 'services.items.aiWeb',
    fallbackTitle: 'AI-Powered Web Applications',
    descKey: 'services.items.aiWebDesc',
    fallbackDesc:
      'Building intelligent web applications that leverage artificial intelligence for enhanced functionality and user experiences.',
    icon: Brain,
    tag: 'AI & Next-Gen',
  },
  {
    id: 'business',
    titleKey: 'services.items.business',
    fallbackTitle: 'Business Websites',
    descKey: 'services.items.businessDesc',
    fallbackDesc:
      'Professional, responsive websites designed to establish and grow your online presence.',
    icon: Building2,
    tag: 'Web Presence',
  },
  {
    id: 'portfolio',
    titleKey: 'services.items.portfolio',
    fallbackTitle: 'Personal Portfolio Websites',
    descKey: 'services.items.portfolioDesc',
    fallbackDesc:
      'Stunning portfolio websites that showcase your work and professional identity.',
    icon: User,
    tag: 'Personal Brand',
  },
  {
    id: 'landing',
    titleKey: 'services.items.landing',
    fallbackTitle: 'Landing Page Development',
    descKey: 'services.items.landingDesc',
    fallbackDesc:
      'High-converting landing pages with compelling design and clear calls to action.',
    icon: Layout,
    tag: 'Conversion',
  },
  {
    id: 'ecommerce',
    titleKey: 'services.items.ecommerce',
    fallbackTitle: 'E-Commerce Websites',
    descKey: 'services.items.ecommerceDesc',
    fallbackDesc:
      'Online stores with product management, payment integration, and seamless shopping experiences.',
    icon: ShoppingCart,
    tag: 'E-Commerce',
  },
  {
    id: 'chatbot',
    titleKey: 'services.items.chatbot',
    fallbackTitle: 'AI Chatbot Integration',
    descKey: 'services.items.chatbotDesc',
    fallbackDesc:
      'Intelligent chatbot solutions powered by AI for customer support and engagement.',
    icon: MessageSquare,
    tag: 'Conversational AI',
  },
  {
    id: 'automation',
    titleKey: 'services.items.automation',
    fallbackTitle: 'Workflow Automation',
    descKey: 'services.items.automationDesc',
    fallbackDesc:
      'Streamlining business processes through automated workflows and integrations.',
    icon: Workflow,
    tag: 'Productivity',
  },
  {
    id: 'api',
    titleKey: 'services.items.api',
    fallbackTitle: 'API Integration',
    descKey: 'services.items.apiDesc',
    fallbackDesc:
      'Connecting applications and services through robust API integrations.',
    icon: Plug,
    tag: 'Integration',
  },
  {
    id: 'redesign',
    titleKey: 'services.items.redesign',
    fallbackTitle: 'Website Redesign & UI Improvements',
    descKey: 'services.items.redesignDesc',
    fallbackDesc:
      'Modernizing existing websites with improved design, performance, and user experience.',
    icon: Paintbrush,
    tag: 'UI/UX Polish',
  },
  {
    id: 'interactive',
    titleKey: 'services.items.interactive',
    fallbackTitle: 'Interactive Animations & 3D Web',
    descKey: 'services.items.interactiveDesc',
    fallbackDesc:
      'Engaging web experiences with animations, 3D elements, and interactive interfaces.',
    icon: Box,
    tag: '3D & Motion',
  },
  {
    id: 'saas',
    titleKey: 'services.items.saas',
    fallbackTitle: 'SaaS Application Development',
    descKey: 'services.items.saasDesc',
    fallbackDesc:
      'Software-as-a-Service applications with subscription management and scalable architecture.',
    icon: Cloud,
    tag: 'Full-Stack SaaS',
  },
];

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

const cardVariants: any = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export interface ServicesSectionProps {
  className?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ className }) => {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className={cn(
        'relative py-20 md:py-28 lg:py-32 overflow-hidden',
        className
      )}
    >
      {/* Background Decorative Ambient Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-600/10 dark:bg-primary-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-10 w-[400px] h-[350px] bg-accent-600/10 dark:bg-accent-600/15 blur-[100px] rounded-full" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <SectionHeader
          title={t('services.sectionTitle', 'Services')}
          subtitle={t('services.sectionSubtitle', 'What I can build')}
          align="center"
        />

        {/* Prominent Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-14 max-w-2xl px-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/10 backdrop-blur-xl p-4 sm:p-5 shadow-lg shadow-amber-500/5 transition-all">
            {/* Subtle glow edge inside */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/20 blur-2xl" />

            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Notice
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-amber-950 dark:text-amber-200 leading-snug">
                  {t('services.disclaimer', 'Currently learning — not accepting clients.')}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-surface-600 dark:text-surface-400">
                  Services shown reflect my active skill set, development explorations, and showcase capabilities.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 11 Services in a Responsive Grid (1 col mobile, 2 cols tablet, 3 cols desktop) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {SERVICES_DATA.map((service, index) => {
            const IconComponent = service.icon;

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={cn(
                  'group relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 lg:p-8',
                  'bg-surface-900/40 dark:bg-surface-900/50 backdrop-blur-xl',
                  'border border-white/10 dark:border-white/10',
                  'hover:border-primary-500/50 dark:hover:border-primary-500/50',
                  'hover:shadow-2xl hover:shadow-primary-500/10',
                  'transition-all duration-300 overflow-hidden'
                )}
              >
                {/* Background Glass Gradient Shimmer on Hover */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />

                {/* Corner Ambient Glow */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary-500/0 group-hover:bg-primary-500/15 blur-xl transition-all duration-500" />

                <div className="relative z-10 flex-1">
                  {/* Top Bar with Icon & Counter/Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary-500/10 dark:bg-primary-500/10 text-primary-400 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-300">
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300 group-hover:rotate-3" />
                    </div>

                    <span className="text-xs font-mono font-medium text-surface-500 dark:text-surface-400 group-hover:text-primary-400 dark:group-hover:text-primary-300 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-surface-900 dark:text-white tracking-tight group-hover:text-primary-400 dark:group-hover:text-primary-300 transition-colors duration-200 mb-2.5">
                    {t(service.titleKey, service.fallbackTitle)}
                  </h3>

                  {/* Service Description */}
                  <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
                    {t(service.descKey, service.fallbackDesc)}
                  </p>
                </div>

                {/* Bottom Accent / Tag Indicator */}
                <div className="relative z-10 mt-6 pt-4 border-t border-white/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary-400/70 group-hover:text-primary-400 transition-colors" />
                    {service.tag}
                  </span>

                  <span className="text-xs font-medium text-primary-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex items-center gap-1">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Card Section: "Contact me for a custom quote" */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 md:mt-20 lg:mt-24"
        >
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 dark:border-white/10 bg-surface-900/50 dark:bg-surface-900/60 backdrop-blur-2xl p-8 sm:p-10 md:p-12 text-center shadow-2xl">
            {/* Glowing radial decorative backdrop */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 border border-primary-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-400 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Collaborations & Discussions
              </span>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white tracking-tight mb-4">
                Have an exciting project or idea in mind?
              </h3>

              <p className="mx-auto max-w-xl text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed mb-8">
                While I am currently focusing on learning and not taking direct client engagements, I am always open to discussing new ideas, tech explorations, and future opportunities.
              </p>

              <a
                href="#contact"
                className={cn(
                  'btn-primary group inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-semibold rounded-xl',
                  'shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]',
                  'transition-all duration-200'
                )}
              >
                <span>{t('services.cta', 'Contact me for a custom quote')}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;

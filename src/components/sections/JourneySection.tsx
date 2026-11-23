import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Code2,
  Layers,
  Terminal,
  BrainCircuit,
  Rocket,
  Sparkles,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { JourneyItem } from '../../types';

export interface JourneySectionProps {
  items?: JourneyItem[];
  className?: string;
}

const DEFAULT_JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: 'journey-1',
    title: 'Started Learning Programming',
    description: 'Began exploring coding through online resources and tutorials.',
    date_label: '2023',
    display_order: 1,
  },
  {
    id: 'journey-2',
    title: 'Built First Web Projects',
    description: 'Created initial web applications using HTML, CSS, and JavaScript.',
    date_label: '2023',
    display_order: 2,
  },
  {
    id: 'journey-3',
    title: 'Discovered Python & Flask',
    description: 'Started backend development and building full-stack applications.',
    date_label: '2024',
    display_order: 3,
  },
  {
    id: 'journey-4',
    title: 'Explored AI & Automation',
    description: 'Began integrating AI APIs and building intelligent applications.',
    date_label: '2024',
    display_order: 4,
  },
  {
    id: 'journey-5',
    title: 'Launched Personal Projects',
    description: 'Published DavaCheck, MealMind AI, WeatherGod, and DotKart.',
    date_label: '2025',
    display_order: 5,
  },
];

function getMilestoneIcon(index: number, title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('program') || lower.includes('coding')) return Code2;
  if (lower.includes('html') || (lower.includes('web') && !lower.includes('god'))) return Layers;
  if (lower.includes('python') || lower.includes('flask') || lower.includes('backend')) return Terminal;
  if (lower.includes('ai') || lower.includes('automation') || lower.includes('intelligent')) return BrainCircuit;
  if (lower.includes('launch') || lower.includes('personal') || lower.includes('published')) return Rocket;

  const fallbackIcons = [Code2, Layers, Terminal, BrainCircuit, Rocket];
  return fallbackIcons[index % fallbackIcons.length] || Sparkles;
}

export function JourneySection({ items, className = '' }: JourneySectionProps) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);

  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>(
    items && items.length > 0 ? items : DEFAULT_JOURNEY_ITEMS
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      setJourneyItems(items);
      return;
    }

    if (!isSupabaseConfigured()) {
      setJourneyItems(DEFAULT_JOURNEY_ITEMS);
      return;
    }

    let isMounted = true;
    async function fetchJourneyItems() {
      try {
        const { data, error } = await supabase
          .from('journey_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Failed to fetch journey items:', error.message);
          return;
        }

        if (isMounted && data && data.length > 0) {
          setJourneyItems(data);
        }
      } catch (err) {
        console.warn('Error loading journey items:', err);
      }
    }

    fetchJourneyItems();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 85%', 'end 70%'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <section
      id="journey"
      className={`relative py-20 md:py-28 lg:py-32 overflow-hidden bg-surface-950 dark:bg-surface-950 light:bg-surface-50 ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-accent-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <SectionHeader
          title={t('journey.sectionTitle', 'Learning Journey')}
          subtitle={t('journey.sectionSubtitle', 'My path in development')}
          badge={t('journey.badge', 'Milestones')}
        />

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative max-w-5xl mx-auto mt-12 md:mt-16">
          {/* Static Track Line */}
          <div
            aria-hidden="true"
            className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 rounded-full bg-surface-800/60 dark:bg-surface-800/60 light:bg-surface-200"
          />

          {/* Animated Glowing Drawn Line */}
          <motion.div
            aria-hidden="true"
            style={{
              scaleY: shouldReduceMotion ? 1 : scaleY,
              originY: 0,
            }}
            className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-primary-500 via-accent-500 to-electric-light shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          />

          {/* Timeline Items */}
          <div className="space-y-10 sm:space-y-14 md:space-y-20">
            {journeyItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const IconComponent = getMilestoneIcon(index, item.title);

              const initialX = shouldReduceMotion
                ? 0
                : isMobile
                ? 40
                : isEven
                ? -60
                : 60;

              return (
                <div
                  key={item.id || index}
                  className={`relative flex items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Card Half */}
                  <div
                    className={`w-full md:w-1/2 pl-12 sm:pl-16 md:pl-0 ${
                      isEven ? 'md:pr-14' : 'md:pl-14'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: initialX }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.3 : 0.6,
                        delay: 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group relative rounded-2xl p-6 sm:p-7 backdrop-blur-xl bg-white/5 dark:bg-white/5 light:bg-white/85 border border-white/10 dark:border-white/10 light:border-surface-200 shadow-xl hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      {/* Top accent highlight */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent group-hover:via-primary-500 transition-all duration-500" />

                      {/* Subtle ambient card glows */}
                      <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-500/20 transition-all duration-500" />
                      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-accent-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-accent-500/20 transition-all duration-500" />

                      {/* Header with date badge & step index */}
                      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-gradient-to-r from-primary-500/15 to-accent-500/15 text-primary-300 dark:text-primary-300 light:text-primary-700 border border-primary-500/25 shadow-sm">
                          <Calendar className="w-3.5 h-3.5 text-primary-400" />
                          {item.date_label}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-white/5 dark:bg-white/5 light:bg-surface-100 border border-white/10 dark:border-white/10 light:border-surface-200 flex items-center justify-center text-primary-400 group-hover:scale-110 group-hover:text-primary-300 transition-all duration-300">
                            <IconComponent className="w-4 h-4" />
                          </span>
                          <span className="text-xs font-mono font-medium text-surface-500 dark:text-surface-500 light:text-surface-400">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* Milestone Title */}
                      <h3 className="relative z-10 text-xl sm:text-2xl font-display font-bold text-white dark:text-white light:text-surface-900 tracking-tight mb-2.5 group-hover:text-primary-300 dark:group-hover:text-primary-300 light:group-hover:text-primary-600 transition-colors duration-200">
                        {item.title}
                      </h3>

                      {/* Milestone Description */}
                      <p className="relative z-10 text-surface-300 dark:text-surface-300 light:text-surface-600 text-sm sm:text-base leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Desktop Horizontal Connector Line */}
                  <div
                    aria-hidden="true"
                    className={`hidden md:block absolute top-7 w-14 h-px ${
                      isEven
                        ? 'right-1/2 bg-gradient-to-r from-transparent via-primary-500/30 to-primary-500/80'
                        : 'left-1/2 bg-gradient-to-l from-transparent via-primary-500/30 to-primary-500/80'
                    }`}
                  />

                  {/* Mobile Horizontal Connector Line */}
                  <div
                    aria-hidden="true"
                    className="block md:hidden absolute left-6 top-7 w-6 sm:w-10 h-px bg-gradient-to-r from-primary-500/80 via-primary-500/30 to-transparent"
                  />

                  {/* Center / Left Gradient Dot Marker */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.15,
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 top-7 z-20"
                  >
                    <div className="relative flex items-center justify-center group/dot">
                      {/* Outer pulsing aura */}
                      <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-electric-light opacity-30 blur-md animate-pulse group-hover/dot:opacity-80 transition-opacity duration-300" />

                      {/* Outer styled circular node */}
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-950 dark:bg-surface-950 light:bg-white border-2 border-primary-500/80 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        {/* Inner radiant gradient core */}
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-primary-400 via-accent-400 to-electric-light shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Empty Spacer Half on Desktop */}
                  <div className="hidden md:block md:w-1/2" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JourneySection;

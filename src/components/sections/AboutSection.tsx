import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, MapPin, GraduationCap, Target } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

export default function AboutSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const infoCards = [
    {
      icon: MapPin,
      label: t('about.locationLabel', 'Location'),
      value: t('about.location'),
    },
    {
      icon: GraduationCap,
      label: t('about.roleLabel', 'Role'),
      value: t('about.role'),
    },
    {
      icon: Target,
      label: t('about.focusLabel', 'Focus'),
      value: t('about.focus'),
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Decorative background glow elements */}
      <div
        className="absolute top-1/3 -left-36 w-80 h-80 sm:w-96 sm:h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-36 w-80 h-80 sm:w-96 sm:h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <SectionHeader
            title={t('about.sectionTitle', 'About Me')}
            subtitle={t('about.sectionSubtitle', 'My journey in software development')}
          />
        </motion.div>

        {/* Two-column layout on desktop; stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Photo Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <div className="relative group">
              {/* Outer ambient glow */}
              <div
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary-500 via-accent-500 to-electric-light opacity-30 group-hover:opacity-60 blur-xl transition duration-500"
                aria-hidden="true"
              />

              {/* Rounded with gradient border ring */}
              <div className="relative p-1 rounded-3xl bg-gradient-to-tr from-primary-500 via-accent-500 to-electric-light shadow-2xl">
                {/* Photo placeholder inner container with gradient background */}
                <div className="w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-[420px] rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-surface-900 via-surface-850 to-surface-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  {/* Subtle decorative radial overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* User icon */}
                  <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-primary-500/20 via-accent-500/20 to-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-5 text-primary-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <User
                      className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.5]"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Photo coming soon text */}
                  <p className="relative z-10 font-display font-medium text-surface-300 text-sm sm:text-base tracking-wide">
                    {t('about.photoComingSoon', 'Photo coming soon')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Three Journey Paragraphs & Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Journey paragraphs */}
            <div className="space-y-4 text-surface-300 text-base sm:text-lg leading-relaxed font-normal">
              <p>{t('about.paragraph1')}</p>
              <p>{t('about.paragraph2')}</p>
              <p>{t('about.paragraph3')}</p>
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {infoCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.45 + index * 0.1,
                    ease: 'easeOut',
                  }}
                  className="glass card-hover rounded-xl p-4 sm:p-5 flex flex-col justify-between border border-white/10 hover:border-primary-500/30 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 shrink-0">
                      <card.icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-surface-400">
                      {card.label}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-surface-100">
                    {card.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { AboutSection };

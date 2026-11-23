import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import JourneySection from '@/components/sections/JourneySection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import GitHubSection from '@/components/sections/GitHubSection';
import ContactSection from '@/components/sections/ContactSection';

/**
 * Home page component that assembles all core sections of the portfolio.
 * Includes page-specific meta tags for SEO and Open Graph sharing.
 */
const Home: React.FC = () => {
  const { t } = useTranslation();

  const title = `Subhasish Dev Adhikary — ${t('hero.title', 'AI & Web Application Developer')}`;
  const description = t(
    'hero.description',
    'I build modern web applications, explore artificial intelligence, and turn creative ideas into practical digital products.'
  );
  const siteUrl = 'https://subhasish.me';
  const ogImageUrl = `${siteUrl}/og-image.png`;

  return (
    <div className="relative w-full">
      <Helmet>
        {/* Page Title and Standard Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="Subhasish Dev Adhikary, Subhasish, AI Developer, Web Application Developer, React, TypeScript, Full Stack, Software Engineer, falakata, West Bengal, India, Portfolio"
        />
        <meta name="author" content="Subhasish Dev Adhikary" />
        <link rel="canonical" href={`${siteUrl}/`} />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:alt" content="Subhasish Dev Adhikary — AI & Web Application Developer" />
        <meta property="og:site_name" content="Subhasish Dev Adhikary Portfolio" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${siteUrl}/`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content="Subhasish Dev Adhikary — AI & Web Application Developer" />
      </Helmet>

      {/* Homepage Sections in Sequence */}
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ServicesSection />
      <JourneySection />
      <BlogPreviewSection />
      <GitHubSection />
      <ContactSection />
    </div>
  );
};

export default Home;

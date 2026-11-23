import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Structured data (JSON-LD) for Subhasish Dev Adhikary
 */
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Subhasish Dev Adhikary',
  jobTitle: 'AI & Web Application Developer',
  url: 'https://subhasish.me',
  sameAs: [
    'https://github.com/subhasish-dev-adhikary',
    'https://linkedin.com/in/subhasish-dev-adhikary',
  ],
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'West Bengal',
    addressCountry: 'India',
  },
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Full-Stack Web Development',
    'React',
    'TypeScript',
    'Next.js',
    'Python',
    'Cloud Architecture',
  ],
};

export const Layout = () => {
  const { pathname } = useLocation();
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Smooth scroll-to-top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  // Track scroll position to toggle the scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-950 text-surface-200 antialiased selection:bg-primary-500/30 selection:text-white">
      <Helmet>
        {/* Default Title & Meta Tags */}
        <title>Subhasish Dev Adhikary — AI & Web Application Developer</title>
        <meta
          name="description"
          content="Portfolio of Subhasish Dev Adhikary — an AI & Web Application Developer from West Bengal, India. Specialized in architecting modern web platforms and intelligent AI applications."
        />
        <meta name="author" content="Subhasish Dev Adhikary" />
        <meta name="keywords" content="Subhasish Dev Adhikary, AI Developer, Web Application Developer, React, TypeScript, West Bengal, India, Portfolio" />
        <link rel="canonical" href="https://subhasish.me" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Subhasish Dev Adhikary — AI & Web Application Developer" />
        <meta
          property="og:description"
          content="Portfolio of Subhasish Dev Adhikary — an AI & Web Application Developer from West Bengal, India. Specialized in architecting modern web platforms and intelligent AI applications."
        />
        <meta property="og:url" content="https://subhasish.me" />
        <meta property="og:site_name" content="Subhasish Dev Adhikary" />
        <meta property="og:image" content="https://subhasish.me/og-image.png" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Subhasish Dev Adhikary — AI & Web Application Developer" />
        <meta
          name="twitter:description"
          content="Portfolio of Subhasish Dev Adhikary — an AI & Web Application Developer from West Bengal, India. Specialized in architecting modern web platforms and intelligent AI applications."
        />
        <meta name="twitter:image" content="https://subhasish.me/og-image.png" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(personSchema)}
        </script>
      </Helmet>

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950 ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } bg-surface-900/80 hover:bg-primary-600 text-surface-200 hover:text-white border-surface-700/60 hover:border-primary-500 shadow-black/40 hover:shadow-primary-500/25 group`}
      >
        <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
};

export default Layout;

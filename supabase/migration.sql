-- ============================================================
-- SUBHASISH PORTFOLIO — Supabase Database Migration
-- ============================================================
-- Run this SQL in your Supabase SQL Editor to set up the database.
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL DEFAULT 'Subhasish Dev Adhikary',
  professional_title TEXT NOT NULL DEFAULT 'AI & Web Application Developer',
  location TEXT DEFAULT 'Jateswar, Falakata, West Bengal, India',
  biography TEXT DEFAULT '',
  email TEXT DEFAULT 'subhasishdebadhikari@gmail.com',
  profile_image_url TEXT,
  avatar_asset_url TEXT,
  resume_url TEXT,
  social_links JSONB DEFAULT '{
    "github": "https://github.com/Subha8436",
    "linkedin": "https://www.linkedin.com/in/subhasish-dev-adhikary-742061281/",
    "email": "subhasishdebadhikari@gmail.com",
    "whatsapp": "",
    "whatsapp_public": false
  }'::jsonb,
  availability_status TEXT DEFAULT 'Currently Learning',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

-- ============================================================
-- TABLE: skills
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💻',
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ============================================================
-- TABLE: blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image_url TEXT,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  reading_time INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- ============================================================
-- TABLE: contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================================
-- TABLE: services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🔧',
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLE: journey_items
-- ============================================================
CREATE TABLE IF NOT EXISTS journey_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date_label TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES (for visitors)
-- ============================================================

-- Profiles: anyone can read
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Projects: public can only see published
CREATE POLICY "projects_public_read" ON projects
  FOR SELECT USING (status = 'published');

-- Skills: public can see active skills
CREATE POLICY "skills_public_read" ON skills
  FOR SELECT USING (active = true);

-- Blog posts: public can see published posts
CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Contact messages: public can INSERT only (submit contact form)
CREATE POLICY "contact_messages_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Services: public can see active services
CREATE POLICY "services_public_read" ON services
  FOR SELECT USING (active = true);

-- Journey items: public can read all
CREATE POLICY "journey_items_public_read" ON journey_items
  FOR SELECT USING (true);

-- ============================================================
-- ADMIN POLICIES (authenticated users only)
-- ============================================================

-- Profiles: admin can update
CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Projects: admin full access
CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Skills: admin full access
CREATE POLICY "skills_admin_all" ON skills
  FOR ALL USING (auth.role() = 'authenticated');

-- Blog posts: admin full access
CREATE POLICY "blog_posts_admin_all" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Contact messages: admin can read, update, delete
CREATE POLICY "contact_messages_admin_read" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "contact_messages_admin_update" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "contact_messages_admin_delete" ON contact_messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Services: admin full access
CREATE POLICY "services_admin_all" ON services
  FOR ALL USING (auth.role() = 'authenticated');

-- Journey items: admin full access
CREATE POLICY "journey_items_admin_all" ON journey_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA: Initial Profile
-- ============================================================

INSERT INTO profiles (full_name, professional_title, location, biography, email)
VALUES (
  'Subhasish Dev Adhikary',
  'AI & Web Application Developer',
  'Jateswar, Falakata, West Bengal, India',
  'Self-taught developer passionate about AI-powered applications, modern web technologies, automation, and interactive experiences. College student exploring the intersection of artificial intelligence and web development.',
  'subhasishdebadhikari@gmail.com'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Projects
-- ============================================================

INSERT INTO projects (title, slug, short_description, full_description, technologies, featured, display_order, status)
VALUES
  (
    'DavaCheck',
    'davacheck',
    'A medicine-awareness project focused on information about potentially fake medicines.',
    'DavaCheck is a medicine-awareness project designed to help users identify and access information about potentially counterfeit or fake medicines. The application provides a platform where users can search for medicines and get verified information about their authenticity, helping protect consumers from harmful counterfeit pharmaceutical products.',
    ARRAY['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    TRUE,
    1,
    'published'
  ),
  (
    'MealMind AI',
    'mealmind-ai',
    'An AI-powered meal-planning and grocery-budgeting project.',
    'MealMind AI leverages artificial intelligence to help users plan their meals and manage grocery budgets effectively. Using the Google Gemini API, the application generates personalized meal plans based on dietary preferences, budget constraints, and available ingredients, making healthy eating more accessible and affordable.',
    ARRAY['Python', 'Flask', 'Google Gemini API', 'JavaScript'],
    TRUE,
    2,
    'published'
  ),
  (
    'WeatherGod',
    'weathergod',
    'A weather application providing real-time weather information.',
    'WeatherGod is a weather application that provides users with real-time weather data and forecasts. The application features an intuitive interface that displays current conditions, temperature, humidity, and weather forecasts, helping users plan their activities around weather conditions.',
    ARRAY['JavaScript', 'HTML', 'CSS', 'Weather API'],
    FALSE,
    3,
    'published'
  ),
  (
    'DotKart',
    'dotkart',
    'An e-commerce and affiliate-shopping project.',
    'DotKart is an e-commerce and affiliate-shopping platform that provides users with a curated shopping experience. The application features product listings, search functionality, and an organized shopping interface designed to help users find and purchase products efficiently.',
    ARRAY['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    FALSE,
    4,
    'published'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Skills
-- ============================================================

INSERT INTO skills (category, name, icon, display_order) VALUES
  ('Frontend', 'HTML5', '🌐', 1),
  ('Frontend', 'CSS3', '🎨', 2),
  ('Frontend', 'JavaScript', '⚡', 3),
  ('Backend', 'Python', '🐍', 1),
  ('Backend', 'Flask', '🧪', 2),
  ('Database', 'Supabase', '⚡', 1),
  ('Database', 'MySQL', '🗄️', 2),
  ('AI & Automation', 'Google Gemini API', '🤖', 1),
  ('AI & Automation', 'Prompt Engineering', '💡', 2),
  ('AI & Automation', 'Workflow Automation', '⚙️', 3),
  ('Development & Deployment Tools', 'Git', '📦', 1),
  ('Development & Deployment Tools', 'GitHub', '🐙', 2),
  ('Development & Deployment Tools', 'Termux', '📱', 3),
  ('Development & Deployment Tools', 'Netlify', '🚀', 4),
  ('Development & Deployment Tools', 'Vercel', '▲', 5),
  ('Development & Deployment Tools', 'VS Code', '💻', 6),
  ('Development & Deployment Tools', 'Google Antigravity', '🔮', 7)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Services
-- ============================================================

INSERT INTO services (title, description, icon, display_order) VALUES
  ('AI-Powered Web Applications', 'Building intelligent web applications that leverage artificial intelligence for enhanced functionality and user experiences.', '🧠', 1),
  ('Business Websites', 'Professional, responsive websites designed to establish and grow your online presence.', '🏢', 2),
  ('Personal Portfolio Websites', 'Stunning portfolio websites that showcase your work and professional identity.', '👤', 3),
  ('Landing Page Development', 'High-converting landing pages with compelling design and clear calls to action.', '📄', 4),
  ('E-Commerce Websites', 'Online stores with product management, payment integration, and seamless shopping experiences.', '🛒', 5),
  ('AI Chatbot Integration', 'Intelligent chatbot solutions powered by AI for customer support and engagement.', '💬', 6),
  ('Workflow Automation', 'Streamlining business processes through automated workflows and integrations.', '⚙️', 7),
  ('API Integration', 'Connecting applications and services through robust API integrations.', '🔌', 8),
  ('Website Redesign & UI Improvements', 'Modernizing existing websites with improved design, performance, and user experience.', '🎨', 9),
  ('Interactive Animations & 3D Web', 'Engaging web experiences with animations, 3D elements, and interactive interfaces.', '🎮', 10),
  ('SaaS Application Development', 'Software-as-a-Service applications with subscription management and scalable architecture.', '☁️', 11)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Journey Items
-- ============================================================

INSERT INTO journey_items (title, description, date_label, display_order) VALUES
  ('Started Learning Programming', 'Began exploring coding through online resources and tutorials, discovering the world of software development.', '2023', 1),
  ('Built First Web Projects', 'Created initial web applications using HTML, CSS, and JavaScript, learning the fundamentals of web development.', '2023', 2),
  ('Discovered Python & Flask', 'Started backend development and building full-stack applications with Python and Flask framework.', '2024', 3),
  ('Explored AI & Automation', 'Began integrating AI APIs and building intelligent applications, exploring the Google Gemini API.', '2024', 4),
  ('Launched Personal Projects', 'Published DavaCheck, MealMind AI, WeatherGod, and DotKart — turning ideas into working applications.', '2025', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS (run separately in Storage settings)
-- ============================================================
-- Create these buckets in Supabase Dashboard > Storage:
-- 1. "avatars" (public) — for profile and avatar images
-- 2. "projects" (public) — for project thumbnails and screenshots
-- 3. "blog" (public) — for blog cover images
-- 4. "uploads" (private) — for resume and other private files

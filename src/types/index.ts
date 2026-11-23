
export interface Profile {
  id: string;
  full_name: string;
  professional_title: string;
  location: string;
  biography: string;
  email: string;
  profile_image_url: string | null;
  avatar_asset_url: string | null;
  resume_url: string | null;
  social_links: SocialLinks;
  availability_status: string;
  updated_at: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  whatsapp?: string;
  email?: string;
  whatsapp_public?: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  technologies: string[];
  thumbnail_url: string | null;
  gallery_urls: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  display_order: number;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  icon: string;
  display_order: number;
  active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  active: boolean;
}

export interface JourneyItem {
  id: string;
  title: string;
  description: string;
  date_label: string;
  display_order: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

export interface AdminStats {
  totalProjects: number;
  publishedArticles: number;
  draftArticles: number;
  unreadMessages: number;
}

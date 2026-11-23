# SUBHASISH — Personal Portfolio

> AI & Web Application Developer from West Bengal, India

A premium, futuristic personal portfolio website built with React, TypeScript, Three.js, and Supabase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3
- **3D Graphics**: Three.js + React Three Fiber
- **Animation**: Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Hosting**: Netlify
- **i18n**: English + Bengali (react-i18next)
- **Email**: Resend (via Netlify Functions)

## 📋 Features

- ✅ Cinematic hero with interactive 3D experience
- ✅ Dark/Light theme with persistence
- ✅ Multilingual support (English + Bengali)
- ✅ Responsive design (mobile-first)
- ✅ Project showcase with detail pages
- ✅ Technical blog with Markdown support
- ✅ GitHub activity integration
- ✅ Contact form with email notifications
- ✅ Admin dashboard for content management
- ✅ SEO optimized with structured data
- ✅ Performance fallbacks for 3D on mobile
- ✅ Row Level Security on all database tables

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm 8+
- A Supabase project (free tier works)
- A Netlify account

### 1. Clone & Install

```bash
git clone https://github.com/Subha8436/subhasish-portfolio.git
cd subhasish-portfolio
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste the contents of `supabase/migration.sql`
4. Run the query

This creates all tables, RLS policies, indexes, triggers, and seed data.

### 4. Create Storage Buckets

In Supabase Dashboard → **Storage**, create these buckets:
- `avatars` (public) — for profile images
- `projects` (public) — for project screenshots
- `blog` (public) — for blog cover images
- `uploads` (private) — for resume and private files

### 5. Create Admin Account

In Supabase Dashboard → **Authentication** → **Users** → **Add User**:
- Email: your admin email
- Password: a strong password
- Auto-confirm: Yes

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment (Netlify)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Subha8436/subhasish-portfolio.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. Configure Environment Variables

In Netlify → **Site settings** → **Environment variables**, add:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ |
| `VITE_SITE_URL` | `https://subhasish.me` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ✅ (for contact form) |
| `RESEND_API_KEY` | Your Resend API key | ⬜ (for email notifications) |
| `CONTACT_EMAIL` | `subhasishdebadhikari@gmail.com` | ⬜ |

### 4. Custom Domain (subhasish.me)

1. In Netlify → **Domain management** → **Add custom domain**
2. Enter `subhasish.me`
3. Update your domain's DNS:
   - Add a CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS
4. Enable HTTPS (automatic with Let's Encrypt)

### 5. Resend Email Setup (Optional)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add `RESEND_API_KEY` to Netlify environment variables
4. For custom sender domain, verify your domain in Resend

## 📁 Project Structure

```
├── index.html                 # Entry HTML
├── netlify.toml               # Netlify configuration
├── netlify/functions/         # Serverless functions
│   └── contact.js             # Contact form handler
├── public/                    # Static assets
├── supabase/
│   └── migration.sql          # Database schema & seed data
├── src/
│   ├── App.tsx                # Router & app shell
│   ├── main.tsx               # Entry point
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, Layout
│   │   ├── sections/          # Homepage sections
│   │   ├── three/             # 3D scene components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # Theme & Auth providers
│   ├── hooks/                 # Custom React hooks
│   ├── i18n/                  # Translations (EN/BN)
│   ├── lib/                   # Supabase, GitHub, utils
│   ├── pages/                 # Route pages
│   │   └── admin/             # Admin dashboard pages
│   ├── styles/                # Global CSS
│   └── types/                 # TypeScript interfaces
└── .env.example               # Environment template
```

## 🔒 Security

- Row Level Security (RLS) on all Supabase tables
- Public visitors can only read published content
- Admin actions require authentication
- Service role key never exposed in frontend
- Contact form has rate limiting and input sanitization
- CSRF protection via SameSite cookies
- Security headers configured in `netlify.toml`

## 📱 Mobile & Performance

- Responsive design with mobile-first approach
- 3D experience gracefully degrades on low-end devices
- WebGL detection with static image fallback
- Respects `prefers-reduced-motion`
- Lazy-loaded routes and components
- Optimized bundle with code splitting
- Image optimization and lazy loading

## 🌐 SEO

- Unique page titles and meta descriptions
- Open Graph metadata for social sharing
- JSON-LD structured data (Person schema)
- Sitemap and robots.txt
- Clean URL structure
- Canonical URLs
- Image alt text
- Semantic HTML

## 📝 Admin Dashboard

Access at `/admin/login` with your Supabase auth credentials.

Features:
- Dashboard overview with stats
- Profile management
- Project CRUD with featured/ordering
- Blog editor with Markdown and preview
- Skills management
- Services management
- Contact message viewer
- Learning journey editor

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by Subhasish Dev Adhikary**

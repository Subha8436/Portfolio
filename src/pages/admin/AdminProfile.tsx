import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, SocialLinks } from '@/types';
import {
  User,
  Briefcase,
  MapPin,
  Mail,
  FileText,
  Camera,
  UploadCloud,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Database,
  FileCheck,
  ShieldCheck,
  Globe,
  Radio,
  FileUp,
  X
} from 'lucide-react';

// Brand SVGs for 100% reliable rendering
function GitHubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

// Available Statuses with custom color themes
const AVAILABILITY_OPTIONS = [
  {
    value: 'Currently Learning',
    label: 'Currently Learning',
    description: 'Expanding skill set and exploring new tech stacks',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
  },
  {
    value: 'Available for Work',
    label: 'Available for Work',
    description: 'Open to freelance contracts and full-time opportunities',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400 animate-pulse',
  },
  {
    value: 'Busy',
    label: 'Busy',
    description: 'Currently occupied with priority client or academic projects',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
];

// Initial Profile State
const DEFAULT_PROFILE: Omit<Profile, 'id' | 'updated_at'> = {
  full_name: 'Subhasish Dev Adhikary',
  professional_title: 'AI & Web Application Developer',
  location: 'Jateswar, Falakata, West Bengal, India',
  biography:
    'Self-taught developer passionate about AI-powered applications, modern web technologies, automation, and interactive experiences. College student exploring the intersection of artificial intelligence and web development.',
  email: 'subhasishdebadhikari@gmail.com',
  profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  avatar_asset_url: null,
  resume_url: 'https://drive.google.com/file/d/your-resume-id/view?usp=sharing',
  availability_status: 'Currently Learning',
  social_links: {
    github: 'https://github.com/Subha8436',
    linkedin: 'https://www.linkedin.com/in/subhasish-dev-adhikary-742061281/',
    email: 'subhasishdebadhikari@gmail.com',
    whatsapp: '+91 84360 00000',
    whatsapp_public: false,
  },
};

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const supabaseConfigured = isSupabaseConfigured();

  // Profile State
  const [profileId, setProfileId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Profile, 'id' | 'updated_at'>>(DEFAULT_PROFILE);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // UI States
  const [fetching, setFetching] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [imagePreviewError, setImagePreviewError] = useState<boolean>(false);

  // File Upload State Simulation & Handlers
  const [photoUploading, setPhotoUploading] = useState<boolean>(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number>(0);
  const [resumeUploading, setResumeUploading] = useState<boolean>(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState<number>(0);
  const [uploadedResumeName, setUploadedResumeName] = useState<string>('subhasish-resume.pdf');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // 1. Auth Guard & Initial Load
  useEffect(() => {
    // If auth state is still resolving, wait
    if (authLoading) return;

    // If Supabase is configured and no authenticated user, redirect to login
    if (supabaseConfigured && !user && !isAdmin) {
      navigate('/admin/login');
      return;
    }

    // Load initial profile data
    loadProfileData();
  }, [authLoading, user, isAdmin, supabaseConfigured, navigate]);

  const loadProfileData = async () => {
    setFetching(true);
    try {
      // 1. Try local storage cache first for instant feedback
      const cached = localStorage.getItem('subhasish_admin_profile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            social_links: {
              ...prev.social_links,
              ...(parsed.social_links || {}),
            },
          }));
          if (parsed.id) setProfileId(parsed.id);
          if (parsed.updated_at) setLastSaved(new Date(parsed.updated_at).toLocaleTimeString());
        } catch {
          // ignore cache parse error
        }
      }

      // 2. Fetch from Supabase if configured
      if (supabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('Could not load profile from Supabase:', error.message);
        } else if (data) {
          setProfileId(data.id);
          setFormData({
            full_name: data.full_name || DEFAULT_PROFILE.full_name,
            professional_title: data.professional_title || DEFAULT_PROFILE.professional_title,
            location: data.location || DEFAULT_PROFILE.location,
            biography: data.biography || DEFAULT_PROFILE.biography,
            email: data.email || DEFAULT_PROFILE.email,
            profile_image_url: data.profile_image_url || DEFAULT_PROFILE.profile_image_url,
            avatar_asset_url: data.avatar_asset_url || null,
            resume_url: data.resume_url || DEFAULT_PROFILE.resume_url,
            availability_status: data.availability_status || DEFAULT_PROFILE.availability_status,
            social_links: {
              github: data.social_links?.github ?? DEFAULT_PROFILE.social_links.github,
              linkedin: data.social_links?.linkedin ?? DEFAULT_PROFILE.social_links.linkedin,
              email: data.social_links?.email ?? DEFAULT_PROFILE.social_links.email,
              whatsapp: data.social_links?.whatsapp ?? DEFAULT_PROFILE.social_links.whatsapp,
              whatsapp_public: data.social_links?.whatsapp_public ?? DEFAULT_PROFILE.social_links.whatsapp_public,
            },
          });
          if (data.updated_at) {
            setLastSaved(new Date(data.updated_at).toLocaleString());
          }
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
    } finally {
      setFetching(false);
    }
  };

  // Form Field Handlers
  const handleInputChange = (field: keyof Omit<Profile, 'id' | 'updated_at' | 'social_links'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === 'profile_image_url') {
      setImagePreviewError(false);
    }
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
    }
  };

  const handleSocialChange = (field: keyof SocialLinks, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [field]: value,
      },
    }));
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
    }
  };

  // Photo Upload Handler (simulated dropzone / Supabase Storage preparation)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setPhotoUploading(true);
    setPhotoUploadProgress(20);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setPhotoUploadProgress(65);
        setTimeout(() => {
          setPhotoUploadProgress(100);
          setPhotoUploading(false);
          const result = reader.result as string;
          setFormData((prev) => ({
            ...prev,
            profile_image_url: result,
          }));
          setImagePreviewError(false);
          setStatusMessage('Photo selected and preview ready! Save profile to store.');
          setSaveStatus('idle');
        }, 300);
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  // Resume Upload Handler (simulated dropzone / Supabase Storage preparation)
  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }

    setResumeUploading(true);
    setResumeUploadProgress(30);

    setTimeout(() => {
      setResumeUploadProgress(75);
      setTimeout(() => {
        setResumeUploadProgress(100);
        setResumeUploading(false);
        setUploadedResumeName(file.name);
        const dummyUrl = `https://storage.portfolio.local/resumes/${file.name}`;
        setFormData((prev) => ({
          ...prev,
          resume_url: dummyUrl,
        }));
        setStatusMessage(`Resume "${file.name}" staged. Click Save Profile to apply.`);
        setSaveStatus('idle');
      }, 350);
    }, 300);
  };

  // Save Profile Handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        professional_title: formData.professional_title.trim(),
        location: formData.location.trim(),
        biography: formData.biography.trim(),
        email: formData.email.trim(),
        profile_image_url: formData.profile_image_url?.trim() || null,
        avatar_asset_url: formData.avatar_asset_url || null,
        resume_url: formData.resume_url?.trim() || null,
        availability_status: formData.availability_status,
        social_links: formData.social_links,
        updated_at: new Date().toISOString(),
      };

      if (supabaseConfigured) {
        let dbError = null;

        if (profileId) {
          const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', profileId);
          dbError = error;
        } else {
          // Check if any row exists first
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)
            .maybeSingle();

          if (existing?.id) {
            setProfileId(existing.id);
            const { error } = await supabase
              .from('profiles')
              .update(payload)
              .eq('id', existing.id);
            dbError = error;
          } else {
            const { data: inserted, error } = await supabase
              .from('profiles')
              .insert([payload])
              .select('id')
              .single();
            if (inserted) setProfileId(inserted.id);
            dbError = error;
          }
        }

        if (dbError) {
          throw new Error(dbError.message);
        }
      }

      // Always save to localStorage as local fallback / cache
      const toCache = {
        ...payload,
        id: profileId || 'local-profile',
      };
      localStorage.setItem('subhasish_admin_profile', JSON.stringify(toCache));

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(nowTime);
      setSaveStatus('success');
      setStatusMessage(
        supabaseConfigured
          ? 'Profile successfully synced to Supabase database!'
          : 'Profile saved locally! (Configure Supabase keys in .env to sync with cloud database)'
      );

      // Auto-hide success toast message after 4.5s
      setTimeout(() => {
        setSaveStatus('idle');
      }, 4500);
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      setSaveStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reset form to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all fields to default values? Any unsaved edits will be lost.')) {
      setFormData(DEFAULT_PROFILE);
      setImagePreviewError(false);
      setSaveStatus('idle');
      setStatusMessage('Restored default values.');
    }
  };

  // Get active status object
  const currentStatusObj =
    AVAILABILITY_OPTIONS.find((s) => s.value === formData.availability_status) || AVAILABILITY_OPTIONS[0];

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-surface-800" />
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-primary-500" />
        </div>
        <p className="mt-4 font-mono text-sm tracking-wide text-surface-400 animate-pulse">
          Loading Profile Settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 font-sans selection:bg-primary-500/30 selection:text-white pb-20">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-surface-400 hover:text-white hover:bg-surface-900 border border-transparent hover:border-surface-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-surface-800" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-primary-400">
                Admin Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-surface-400 font-mono">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved at {lastSaved}</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-medium shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Title & Status Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-mono font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Identity & Portfolio Metadata</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-surface-400 max-w-2xl">
              Manage your personal information, public biography, avatar, resume document, contact details, and social links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400">Current Status:</span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${currentStatusObj.badgeClass}`}
            >
              <span className={`w-2 h-2 rounded-full ${currentStatusObj.dotClass}`} />
              <span>{currentStatusObj.label}</span>
            </div>
          </div>
        </div>

        {/* Supabase Connection Status Callout */}
        <div
          className={`mb-8 p-4 rounded-xl border backdrop-blur-md transition-all ${
            supabaseConfigured
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`mt-0.5 p-2 rounded-lg ${
                supabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {supabaseConfigured ? <Database className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <span>{supabaseConfigured ? 'Supabase Database Connected' : 'Supabase Inactive / Local Mode'}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded ${
                    supabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {supabaseConfigured ? 'Live PostgreSQL Table: profiles' : 'Demo / Local Storage'}
                </span>
              </div>
              <p className="mt-1 text-surface-300 text-xs sm:text-sm leading-relaxed">
                {supabaseConfigured
                  ? 'Changes are automatically pushed to the PostgreSQL `profiles` table with row-level security. The public portfolio reads live from this table.'
                  : 'Supabase credentials are not detected or currently using placeholders. You can freely edit and test the profile form — data is stored locally in browser storage until `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided.'}
              </p>
              {profileId && (
                <div className="mt-2 text-xs font-mono text-surface-400 flex items-center gap-2">
                  <span>Record ID:</span>
                  <code className="text-surface-200 bg-surface-900 px-1.5 py-0.5 rounded border border-surface-800">
                    {profileId}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Save Feedback Banner */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium">{statusMessage || 'Profile saved successfully!'}</span>
            </div>
            <button
              onClick={() => setSaveStatus('idle')}
              className="text-emerald-400 hover:text-emerald-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-sm font-medium">{statusMessage || 'Error saving profile.'}</span>
            </div>
            <button
              onClick={() => setSaveStatus('idle')}
              className="text-rose-400 hover:text-rose-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main 2-Column Responsive Layout */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Profile Overview, Avatar Preview, Photo & Resume Upload Placeholders (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Card Preview */}
            <div className="glass rounded-2xl p-6 border border-surface-800/80 bg-surface-900/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  Visitor View
                </span>
              </div>

              <h2 className="text-xs font-mono uppercase tracking-wider text-surface-400 font-semibold mb-4">
                Card Preview
              </h2>

              <div className="flex flex-col items-center text-center">
                {/* Avatar with Status Ring */}
                <div className="relative mb-4 group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-surface-800 border-2 border-surface-700/80 shadow-2xl flex items-center justify-center">
                    {formData.profile_image_url && !imagePreviewError ? (
                      <img
                        src={formData.profile_image_url}
                        alt={formData.full_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImagePreviewError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-surface-500 p-2 text-center">
                        <User className="w-10 h-10 mb-1" />
                        <span className="text-[10px] font-mono">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Availability Badge */}
                  <div
                    title={currentStatusObj.label}
                    className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl border bg-surface-900 ${currentStatusObj.badgeClass} shadow-md`}
                  >
                    <div className={`w-3 h-3 rounded-full ${currentStatusObj.dotClass}`} />
                  </div>
                </div>

                {/* Name & Title */}
                <h3 className="text-lg font-bold text-white font-display">
                  {formData.full_name || 'Subhasish Dev Adhikary'}
                </h3>
                <p className="text-xs font-medium text-primary-400 mt-0.5">
                  {formData.professional_title || 'AI & Web Application Developer'}
                </p>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-surface-400">
                  <MapPin className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                  <span className="truncate max-w-[220px]">{formData.location}</span>
                </div>

                {/* Social Quick Bar */}
                <div className="mt-5 pt-5 border-t border-surface-800/80 w-full flex items-center justify-center gap-3">
                  {formData.social_links.github && (
                    <a
                      href={formData.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-800/80 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
                      title="GitHub Profile"
                    >
                      <GitHubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {formData.social_links.linkedin && (
                    <a
                      href={formData.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-800/80 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
                      title="LinkedIn Profile"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  )}
                  {formData.social_links.whatsapp && (
                    <div
                      className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                        formData.social_links.whatsapp_public
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-surface-800/50 text-surface-500 opacity-60'
                      }`}
                      title={
                        formData.social_links.whatsapp_public
                          ? `Public WhatsApp: ${formData.social_links.whatsapp}`
                          : 'WhatsApp (Hidden from public)'
                      }
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      {!formData.social_links.whatsapp_public && <EyeOff className="w-3 h-3" />}
                    </div>
                  )}
                  {formData.resume_url && (
                    <a
                      href={formData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 transition-colors"
                      title="View Resume"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Upload Placeholder Card */}
            <div className="glass rounded-2xl p-6 border border-surface-800/80 bg-surface-900/60 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-white">Photo Upload</h3>
                </div>
                <span className="text-[10px] font-mono text-surface-400 bg-surface-800/60 px-2 py-0.5 rounded">
                  avatars bucket
                </span>
              </div>
              <p className="text-xs text-surface-400 mb-4 leading-relaxed">
                Upload a professional headshot to Supabase Storage. Supports JPG, PNG, or WEBP up to 5MB.
              </p>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-surface-700 hover:border-primary-500/60 bg-surface-950/40 hover:bg-surface-800/30 rounded-xl p-5 text-center cursor-pointer transition-all group"
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-surface-200 group-hover:text-white block">
                  Click to select new photo
                </span>
                <span className="text-[11px] text-surface-500 mt-1 block">
                  or drag and drop image file here
                </span>

                {photoUploading && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${photoUploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-primary-400 mt-1 block">
                      Uploading to Supabase Storage ({photoUploadProgress}%)...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Upload Placeholder Card */}
            <div className="glass rounded-2xl p-6 border border-surface-800/80 bg-surface-900/60 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-accent-400" />
                  <h3 className="text-sm font-semibold text-white">Resume Document</h3>
                </div>
                <span className="text-[10px] font-mono text-surface-400 bg-surface-800/60 px-2 py-0.5 rounded">
                  documents bucket
                </span>
              </div>
              <p className="text-xs text-surface-400 mb-4 leading-relaxed">
                Upload your updated CV / Resume to Supabase Storage. Supports PDF and DOCX up to 10MB.
              </p>

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf, .doc, .docx, application/pdf"
                onChange={handleResumeSelect}
                className="hidden"
              />

              <div
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-surface-700 hover:border-accent-500/60 bg-surface-950/40 hover:bg-surface-800/30 rounded-xl p-5 text-center cursor-pointer transition-all group"
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-accent-400 group-hover:bg-accent-500/10 transition-colors mb-2">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-surface-200 group-hover:text-white block">
                  Upload PDF or DOCX resume
                </span>
                <span className="text-[11px] text-surface-500 mt-1 block truncate max-w-[200px] mx-auto">
                  {uploadedResumeName || 'No file selected yet'}
                </span>

                {resumeUploading && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-500 transition-all duration-300"
                        style={{ width: `${resumeUploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-accent-400 mt-1 block">
                      Uploading to Supabase Storage ({resumeUploadProgress}%)...
                    </span>
                  </div>
                )}
              </div>

              {formData.resume_url && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-surface-400 truncate max-w-[170px]">
                    Current: {formData.resume_url.substring(0, 30)}...
                  </span>
                  <a
                    href={formData.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 font-medium"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Full Profile Form (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Basic Information Section */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-surface-800/80 bg-surface-900/60 shadow-xl">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-800">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">General Information</h2>
                  <p className="text-xs text-surface-400">Personal details displayed on your hero header and bio cards</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Subhasish Dev Adhikary"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Professional Title */}
                <div>
                  <label htmlFor="professional_title" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    Professional Title <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="professional_title"
                      type="text"
                      required
                      value={formData.professional_title}
                      onChange={(e) => handleInputChange('professional_title', e.target.value)}
                      placeholder="AI & Web Application Developer"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Jateswar, Falakata, West Bengal, India"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="subhasishdebadhikari@gmail.com"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Availability Status Select */}
                <div className="sm:col-span-2">
                  <label htmlFor="availability_status" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    Availability Status
                  </label>
                  <div className="relative">
                    <select
                      id="availability_status"
                      value={formData.availability_status}
                      onChange={(e) => handleInputChange('availability_status', e.target.value)}
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-surface-900 text-white">
                          {option.label} — {option.description}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-surface-400">
                      <Radio className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-surface-400">
                    Controls the status badge shown on your hero banner and contact section.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Biography Section */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-surface-800/80 bg-surface-900/60 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Biography & About Me</h2>
                    <p className="text-xs text-surface-400">Tell visitors about your background, passions, and expertise</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-surface-400">
                  {formData.biography.length} characters
                </span>
              </div>

              <div>
                <label htmlFor="biography" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                  Full Biography
                </label>
                <textarea
                  id="biography"
                  rows={5}
                  value={formData.biography}
                  onChange={(e) => handleInputChange('biography', e.target.value)}
                  placeholder="Introduce yourself, your coding journey, tech stacks, and career goals..."
                  className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl p-4 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all resize-y leading-relaxed"
                />
                <p className="mt-2 text-[11px] text-surface-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  <span>Supports markdown syntax, line breaks, and formatting in the about section.</span>
                </p>
              </div>
            </div>

            {/* 3. Media & Document URLs */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-surface-800/80 bg-surface-900/60 shadow-xl">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-800">
                <div className="p-2 rounded-lg bg-electric-light/10 text-electric-light border border-electric-light/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Media & Asset URLs</h2>
                  <p className="text-xs text-surface-400">Direct CDN or Cloud Storage links for profile photo and resume</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Profile Image URL */}
                <div>
                  <label htmlFor="profile_image_url" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    Profile Image URL
                  </label>
                  <div className="relative">
                    <input
                      id="profile_image_url"
                      type="url"
                      value={formData.profile_image_url || ''}
                      onChange={(e) => handleInputChange('profile_image_url', e.target.value)}
                      placeholder="https://images.unsplash.com/... or Supabase storage public URL"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-mono text-xs"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-surface-400">
                    You can either paste an image link directly or use the photo upload dropzone on the left to set this.
                  </p>
                </div>

                {/* Resume URL */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="resume_url" className="text-xs font-mono uppercase tracking-wider text-surface-300 font-medium">
                      Resume / CV URL
                    </label>
                    {formData.resume_url && (
                      <a
                        href={formData.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="resume_url"
                      type="url"
                      value={formData.resume_url || ''}
                      onChange={(e) => handleInputChange('resume_url', e.target.value)}
                      placeholder="https://drive.google.com/file/... or Supabase document URL"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-mono text-xs"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-surface-400">
                    Linked to the &quot;Download CV&quot; buttons on the public home and contact pages.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Social Links & Visibility Privacy */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-surface-800/80 bg-surface-900/60 shadow-xl">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-surface-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Social Links & Privacy</h2>
                  <p className="text-xs text-surface-400">Configure your profiles and control visibility of sensitive details</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* GitHub URL */}
                <div>
                  <label htmlFor="github_url" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                      <GitHubIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="github_url"
                      type="url"
                      value={formData.social_links.github || ''}
                      onChange={(e) => handleSocialChange('github', e.target.value)}
                      placeholder="https://github.com/Subha8436"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label htmlFor="linkedin_url" className="block text-xs font-mono uppercase tracking-wider text-surface-300 mb-2 font-medium">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                      <LinkedInIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="linkedin_url"
                      type="url"
                      value={formData.social_links.linkedin || ''}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      placeholder="https://www.linkedin.com/in/subhasish-dev-adhikary-742061281/"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                {/* WhatsApp Number with Privacy Toggle */}
                <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <label htmlFor="whatsapp_number" className="text-xs font-mono uppercase tracking-wider text-surface-300 font-medium">
                      WhatsApp Number
                    </label>

                    {/* Visibility Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleSocialChange('whatsapp_public', !formData.social_links.whatsapp_public)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        formData.social_links.whatsapp_public
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-surface-800 text-surface-400 border-surface-700'
                      }`}
                    >
                      {formData.social_links.whatsapp_public ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Visible to Public</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-surface-400" />
                          <span>Hidden (Private)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <input
                      id="whatsapp_number"
                      type="tel"
                      value={formData.social_links.whatsapp || ''}
                      onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                      placeholder="+91 84360 00000"
                      className="w-full bg-surface-950/70 border border-surface-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-xs"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-surface-400">
                    {formData.social_links.whatsapp_public
                      ? '✓ Your WhatsApp number will be visible to visitors and prospective clients.'
                      : '🔒 Hidden by default. Your number will NOT be rendered on public pages unless toggled above.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="sticky bottom-4 z-30 p-4 rounded-2xl glass bg-surface-900/90 border border-surface-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-surface-400 hover:text-white hover:bg-surface-800 transition-all border border-surface-700/60"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
                {lastSaved && (
                  <span className="text-xs text-surface-500 hidden sm:inline">
                    Last saved: {lastSaved}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-semibold shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

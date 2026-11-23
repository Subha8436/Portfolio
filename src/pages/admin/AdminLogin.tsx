import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Database,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const isConfigured = isSupabaseConfigured();

  // If already logged in (user exists), redirect to /admin immediately
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Client-side form validation
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage(
        'Supabase is not configured. Please add your credentials to the .env file before signing in.'
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        setErrorMessage(
          error.message || 'Authentication failed. Please check your credentials.'
        );
        setIsSubmitting(false);
      } else {
        // Successful login: redirect to /admin
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during login.'
      );
      setIsSubmitting(false);
    }
  };

  // If auth is still determining current session, render loading state
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-surface-800" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-primary-500" />
          </div>
          <span className="font-display text-sm tracking-[0.25em] uppercase text-surface-400 font-semibold">
            SUBHASISH
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Login | SUBHASISH</title>
        <meta name="description" content="Admin login portal for SUBHASISH portfolio" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen w-full bg-surface-950 text-surface-200 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Ambient background glow effects */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-accent-600/10 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="w-full max-w-md relative z-10">
          {/* Glass Morphism Card */}
          <div className="glass relative rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 bg-surface-900/60 backdrop-blur-xl">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-electric rounded-t-2xl" />

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* SUBHASISH wordmark */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3 shadow-inner">
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="font-display text-xs font-semibold tracking-[0.25em] text-surface-300 uppercase">
                  SUBHASISH
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Admin Login
              </h1>
              <p className="text-sm text-surface-400 mt-1.5">
                Sign in to access portfolio management dashboard
              </p>
            </div>

            {/* Supabase Not Configured Alert & Instructions */}
            {!isConfigured && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <h2 className="font-medium text-amber-300 text-sm">
                      Supabase Setup Required
                    </h2>
                    <p className="text-surface-300 text-xs leading-relaxed">
                      Supabase is not configured yet. Set up your environment variables to enable authentication:
                    </p>
                    <div className="p-2.5 rounded-lg bg-surface-950/80 border border-surface-800 font-mono text-xs text-surface-300 overflow-x-auto space-y-1">
                      <div className="text-surface-500"># In your .env file at project root:</div>
                      <div>
                        <span className="text-primary-400">VITE_SUPABASE_URL</span>=https://your-project.supabase.co
                      </div>
                      <div>
                        <span className="text-primary-400">VITE_SUPABASE_ANON_KEY</span>=your-anon-key-here
                      </div>
                    </div>
                    <p className="text-surface-400 text-xs">
                      Then create an admin account in your{' '}
                      <span className="text-surface-200 font-medium">Supabase Dashboard &gt; Authentication &gt; Users</span>{' '}
                      and restart Vite.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-sm animate-in"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium uppercase tracking-wider text-surface-400 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: undefined }));
                      }
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    disabled={isSubmitting || !isConfigured}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-950/70 border text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationErrors.email
                        ? 'border-rose-500/60 focus:ring-rose-500/40 focus:border-rose-500'
                        : 'border-surface-700/80 focus:ring-primary-500 focus:border-transparent'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium uppercase tracking-wider text-surface-400 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: undefined }));
                      }
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting || !isConfigured}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-950/70 border text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationErrors.password
                        ? 'border-rose-500/60 focus:ring-rose-500/40 focus:border-rose-500'
                        : 'border-surface-700/80 focus:ring-primary-500 focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting || !isConfigured}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isConfigured}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium text-sm hover:from-primary-500 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Link back to home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Return to Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

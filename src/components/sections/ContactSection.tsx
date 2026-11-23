import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import supabase, { isSupabaseConfigured } from '@/lib/supabase';

// SVG icon for GitHub with Lucide styling
function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// SVG icon for LinkedIn with Lucide styling
function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error' | 'not_configured';

export default function ContactSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const isSubmitting = status === 'submitting';

  // Contact info methods
  const contactMethods = [
    {
      id: 'email',
      name: t('contact.email', 'Email'),
      value: 'subhasishdebadhikari@gmail.com',
      href: 'mailto:subhasishdebadhikari@gmail.com',
      icon: Mail,
      isExternal: false,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-400 group-hover:border-blue-500/40',
    },
    {
      id: 'github',
      name: t('contact.github', 'GitHub'),
      value: 'github.com/Subha8436',
      href: 'https://github.com/Subha8436',
      icon: GithubIcon,
      isExternal: true,
      color: 'from-purple-500/10 to-violet-500/10 text-purple-400 group-hover:border-purple-500/40',
    },
    {
      id: 'linkedin',
      name: t('contact.linkedin', 'LinkedIn'),
      value: 'Subhasish Dev Adhikary',
      href: 'https://www.linkedin.com/in/subhasish-dev-adhikary-742061281/',
      icon: LinkedinIcon,
      isExternal: true,
      color: 'from-sky-500/10 to-cyan-500/10 text-sky-400 group-hover:border-sky-500/40',
    },
  ];

  // Client-side validation
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Name required
    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.validation.nameRequired', 'Name is required');
    }

    // Email required & valid format
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.validation.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t(
        'contact.form.validation.emailInvalid',
        'Please enter a valid email address'
      );
    }

    // Subject required
    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.validation.subjectRequired', 'Subject is required');
    }

    // Message required & min 10 characters
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.validation.messageRequired', 'Message is required');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t(
        'contact.form.validation.messageMinLength',
        'Message must be at least 10 characters'
      );
    }

    return newErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field once user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof FormErrors];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Duplicate submission protection: prevent re-submission if already submitted until reset
    if (isSubmitting || isSubmitted) {
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');
    setErrorMessage(null);

    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        setStatus('not_configured');
        setIsSubmitted(true);
        return;
      }

      // Insert message into Supabase contact_messages table
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      ]);

      if (error) {
        throw error;
      }

      // Success state
      setStatus('success');
      setIsSubmitted(true);

      // Reset form fields after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err: unknown) {
      console.error('Failed to submit contact message:', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t('contact.form.error', 'Failed to send message. Please try again or email me directly.')
      );
    }
  };

  // Reset form and allow new submission
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setErrors({});
    setStatus('idle');
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background glow accents */}
      <div
        className="absolute top-1/4 -left-40 w-80 sm:w-96 h-80 sm:h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-accent-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            title={t('contact.sectionTitle', 'Get In Touch')}
            subtitle={t('contact.sectionSubtitle', "Let's connect")}
          />
        </motion.div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mt-8">
          {/* Left Column: Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Intro Paragraph */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 dark:border-white/10 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-3">
                <span className="gradient-text">{t('contact.sectionSubtitle', "Let's connect")}</span>
              </h3>
              <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
                {t(
                  'contact.intro',
                  'Have a question, want to collaborate, or just want to say hi? Feel free to reach out.'
                )}
              </p>
            </div>

            {/* Contact Method Cards */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <motion.a
                    key={method.id}
                    href={method.href}
                    target={method.isExternal ? '_blank' : undefined}
                    rel={method.isExternal ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="glass card-hover rounded-xl p-5 border border-white/10 flex items-center justify-between group transition-all duration-300 block"
                    aria-label={`${method.name}: ${method.value}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${method.color} border border-white/10 shrink-0 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-surface-400 group-hover:text-primary-400 transition-colors">
                          {method.name}
                        </span>
                        <span className="block text-sm sm:text-base font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                          {method.value}
                        </span>
                      </div>
                    </div>
                    <div className="text-surface-500 group-hover:text-primary-400 transition-colors pl-3 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            className="lg:col-span-7"
          >
            <div className="glass rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl relative">
              {/* Notification Banner / Status Feedback */}
              <div className="mb-6 space-y-4">
                {/* Success State */}
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3"
                    role="status"
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <div className="flex-1 text-sm font-medium">
                      <p>
                        {t(
                          'contact.form.success',
                          "Message sent successfully! I'll get back to you soon."
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error State */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start gap-3"
                    role="alert"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                    <div className="flex-1 text-sm font-medium">
                      <p>
                        {errorMessage ||
                          t(
                            'contact.form.error',
                            'Failed to send message. Please try again or email me directly.'
                          )}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Supabase Not Configured Message */}
                {status === 'not_configured' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3"
                    role="alert"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-amber-200 mb-1">
                        Backend setup in progress
                      </p>
                      <p>
                        {t(
                          'contact.form.notConfigured',
                          'Backend is not configured yet. The form will work once backend is set up.'
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-surface-300 mb-2"
                  >
                    {t('contact.form.name', 'Your Name')} <span className="text-primary-400">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.name', 'Your Name')}
                    disabled={isSubmitting || (isSubmitted && status === 'success')}
                    className={`input-field ${
                      errors.name
                        ? '!border-rose-500 focus:!ring-rose-500/30'
                        : ''
                    }`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    required
                  />
                  {errors.name && (
                    <p
                      id="contact-name-error"
                      className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-surface-300 mb-2"
                  >
                    {t('contact.form.email', 'Your Email')} <span className="text-primary-400">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.email', 'Your Email')}
                    disabled={isSubmitting || (isSubmitted && status === 'success')}
                    className={`input-field ${
                      errors.email
                        ? '!border-rose-500 focus:!ring-rose-500/30'
                        : ''
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    required
                  />
                  {errors.email && (
                    <p
                      id="contact-email-error"
                      className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-surface-300 mb-2"
                  >
                    {t('contact.form.subject', 'Subject')} <span className="text-primary-400">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.subject', 'Subject')}
                    disabled={isSubmitting || (isSubmitted && status === 'success')}
                    className={`input-field ${
                      errors.subject
                        ? '!border-rose-500 focus:!ring-rose-500/30'
                        : ''
                    }`}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                    required
                  />
                  {errors.subject && (
                    <p
                      id="contact-subject-error"
                      className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                {/* Message Field (Textarea) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-surface-300"
                    >
                      {t('contact.form.message', 'Your Message')} <span className="text-primary-400">*</span>
                    </label>
                    <span className="text-xs text-surface-500">
                      {formData.message.length} chars (min 10)
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.message', 'Your Message')}
                    disabled={isSubmitting || (isSubmitted && status === 'success')}
                    className={`input-field resize-none ${
                      errors.message
                        ? '!border-rose-500 focus:!ring-rose-500/30'
                        : ''
                    }`}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    required
                  />
                  {errors.message && (
                    <p
                      id="contact-message-error"
                      className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Form Action Controls */}
                <div className="pt-2 space-y-3">
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="btn-primary w-full py-3.5 px-6 rounded-lg text-base font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('contact.form.sending', 'Sending...')}</span>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>{t('contact.form.submitted', 'Message Submitted')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{t('contact.form.send', 'Send Message')}</span>
                      </>
                    )}
                  </button>

                  {/* Reset Option (Duplicate Submission Protection Reset) */}
                  {isSubmitted && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-secondary w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-surface-800 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{t('contact.form.sendAnother', 'Send another message')}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { ContactSection };

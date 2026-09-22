'use client';

import { useState, useRef } from 'react';
import { Mail, Lock, Eye as EyeIcon, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { login } from '@/lib/auth';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export default function Login({ onSwitchToSignup }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      const email = value.trim();
      if (!email) return 'Email address is required';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) return 'Please enter a valid email address (e.g. name@domain.com)';
      return '';
    }

    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    }

    return '';
  };

  const validateAll = () => {
    const emailErr = validateField('email', formData.email);
    const passwordErr = validateField('password', formData.password);

    const newErrors: Record<string, string> = {};
    if (emailErr) newErrors.email = emailErr;
    if (passwordErr) newErrors.password = passwordErr;

    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time revalidation if touched or submit attempted
    if (touched[field] || submitAttempted) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const isEmailValid = touched.email && !errors.email && formData.email.trim().length > 0;
  const isPasswordValid = touched.password && !errors.password && formData.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ email: true, password: true });

    const currentErrors = validateAll();
    if (Object.keys(currentErrors).length > 0) {
      if (currentErrors.email) {
        emailInputRef.current?.focus();
      } else if (currentErrors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: formData.email.trim(), password: formData.password });
      toast.success('Welcome back to CeylonTour!', {
        description: `Signed in as ${formData.email.trim()}. Redirecting...`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Welcome Back
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 leading-relaxed">
          Sign in to access your curated eco-routes & travel bookings.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold text-foreground">
              Email Address <span className="text-rose-500">*</span>
            </label>
            {isEmailValid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" /> Valid email
              </span>
            )}
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
              errors.email && (touched.email || submitAttempted)
                ? 'text-rose-500'
                : 'text-muted-foreground group-focus-within:text-[#44A6B5]'
            }`}>
              <Mail className="w-4 h-4" />
            </div>
            <input
              ref={emailInputRef}
              id="login-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@domain.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email && (touched.email || submitAttempted))}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 transition-all outline-none ${
                errors.email && (touched.email || submitAttempted)
                  ? 'border border-rose-500 bg-rose-500/[0.03] ring-2 ring-rose-500/15 focus:ring-rose-500/25'
                  : isEmailValid
                  ? 'border border-emerald-500/60 bg-background/80 ring-1 ring-emerald-500/20'
                  : 'border border-border/80 bg-background/80 hover:border-[#44A6B5]/50 focus:border-[#44A6B5] focus:ring-2 focus:ring-[#44A6B5]/20'
              }`}
            />
            {isEmailValid && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {errors.email && (touched.email || submitAttempted) && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-rose-500">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>
          <AnimatePresence>
            {errors.email && (touched.email || submitAttempted) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-rose-500 dark:text-rose-400 text-[11px] mt-1.5 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-foreground">
              Password <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => toast.info('Password reset instructions sent to your registered email.')}
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
              errors.password && (touched.password || submitAttempted)
                ? 'text-rose-500'
                : 'text-muted-foreground group-focus-within:text-[#44A6B5]'
            }`}>
              <Lock className="w-4 h-4" />
            </div>
            <input
              ref={passwordInputRef}
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password && (touched.password || submitAttempted))}
              className={`w-full pl-10 pr-20 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 transition-all outline-none ${
                errors.password && (touched.password || submitAttempted)
                  ? 'border border-rose-500 bg-rose-500/[0.03] ring-2 ring-rose-500/15 focus:ring-rose-500/25'
                  : isPasswordValid
                  ? 'border border-emerald-500/60 bg-background/80 ring-1 ring-emerald-500/20'
                  : 'border border-border/80 bg-background/80 hover:border-[#44A6B5]/50 focus:border-[#44A6B5] focus:ring-2 focus:ring-[#44A6B5]/20'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
              {isPasswordValid && (
                <span className="text-emerald-500 pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {errors.password && (touched.password || submitAttempted) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-rose-500 dark:text-rose-400 text-[11px] mt-1.5 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-[#44A6B5] focus:ring-[#44A6B5]/30 accent-[#44A6B5]"
            />
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">Keep me signed in</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#004554] via-[#00586b] to-[#44A6B5] hover:opacity-95 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to CeylonTour</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="mt-5 pt-4 border-t border-border/70 text-center">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer ml-0.5"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
}

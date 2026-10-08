'use client';

import { useState, useRef } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye as EyeIcon,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { getAuthErrorMessage } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { register } = useAuth();

  // Dynamic Password Criteria Calculations
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-muted' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-destructive' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-warning' };
    return { score: 3, label: 'Strong', color: 'bg-success' };
  };

  const strength = getPasswordStrength(formData.password);

  const validateField = (field: keyof typeof formData, value: unknown) => {
    if (field === 'username') {
      const name = String(value || '').trim();
      if (!name) return 'Full name is required';
      if (name.length < 2) return 'Full name must be at least 2 characters';
      if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Please enter a valid name';
      return '';
    }

    if (field === 'email') {
      const email = String(value || '').trim();
      if (!email) return 'Email address is required';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) return 'Please enter a valid email address (e.g. name@domain.com)';
      return '';
    }

    if (field === 'password') {
      const pwd = String(value || '');
      if (!pwd) return 'Password is required';
      if (pwd.length < 8) return 'Password must be at least 8 characters';
      return '';
    }

    if (field === 'confirmPassword') {
      const confirm = String(value || '');
      if (!confirm) return 'Please confirm your password';
      if (confirm !== formData.password) return 'Passwords do not match';
      return '';
    }

    if (field === 'agreedToTerms') {
      if (!value) return 'You must agree to the Terms of Service & Privacy Policy';
      return '';
    }

    return '';
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof typeof formData, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value as never };
      return updated;
    });

    // If typing password, also re-validate confirm password if touched
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = formData.confirmPassword
        ? value === formData.confirmPassword
          ? ''
          : 'Passwords do not match'
        : 'Please confirm your password';
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }

    if (touched[field] || submitAttempted) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isUsernameValid = touched.username && !errors.username && formData.username.trim().length >= 2;
  const isEmailValid = touched.email && !errors.email && formData.email.trim().length > 0;
  const isPasswordValid = touched.password && !errors.password && hasMinLength;
  const isConfirmValid = touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreedToTerms: true,
    });

    const currentErrors = validateAll();
    if (Object.keys(currentErrors).length > 0) {
      if (currentErrors.username) usernameRef.current?.focus();
      else if (currentErrors.email) emailRef.current?.focus();
      else if (currentErrors.password) passwordRef.current?.focus();
      else if (currentErrors.confirmPassword) confirmPasswordRef.current?.focus();
      else if (currentErrors.agreedToTerms) termsRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        name: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success('Account created successfully!', {
        description: `Welcome to CeylonTour, ${formData.username.trim()}!`,
        icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      });
      router.replace(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err, 'register'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Create Traveler Account
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
          Join conscious travelers exploring authentic Sri Lanka.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {/* Full Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-username" className="block text-xs font-semibold text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            {isUsernameValid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <Check className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
              errors.username && (touched.username || submitAttempted)
                ? 'text-destructive'
                : 'text-muted-foreground group-focus-within:text-primary'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <input
              ref={usernameRef}
              id="reg-username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              placeholder="e.g. Amaya Perera"
              autoComplete="name"
              aria-invalid={Boolean(errors.username && (touched.username || submitAttempted))}
              className={`w-full pl-10 pr-10 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 transition-all outline-none ${
                errors.username && (touched.username || submitAttempted)
                  ? 'border border-destructive bg-destructive/[0.03] ring-2 ring-destructive/15 focus:ring-destructive/25'
                  : isUsernameValid
                  ? 'border border-success/60 bg-background/80 ring-1 ring-success/20'
                  : 'border border-border/80 bg-background/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-ring/20'
              }`}
            />
            {isUsernameValid && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-success">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {errors.username && (touched.username || submitAttempted) && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-destructive">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>
          <AnimatePresence>
            {errors.username && (touched.username || submitAttempted) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-destructive text-[11px] mt-1 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.username}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-email" className="block text-xs font-semibold text-foreground">
              Email Address <span className="text-destructive">*</span>
            </label>
            {isEmailValid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <Check className="w-3 h-3" /> Valid email
              </span>
            )}
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
              errors.email && (touched.email || submitAttempted)
                ? 'text-destructive'
                : 'text-muted-foreground group-focus-within:text-primary'
            }`}>
              <Mail className="w-4 h-4" />
            </div>
            <input
              ref={emailRef}
              id="reg-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@domain.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email && (touched.email || submitAttempted))}
              className={`w-full pl-10 pr-10 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 transition-all outline-none ${
                errors.email && (touched.email || submitAttempted)
                  ? 'border border-destructive bg-destructive/[0.03] ring-2 ring-destructive/15 focus:ring-destructive/25'
                  : isEmailValid
                  ? 'border border-success/60 bg-background/80 ring-1 ring-success/20'
                  : 'border border-border/80 bg-background/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-ring/20'
              }`}
            />
            {isEmailValid && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-success">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {errors.email && (touched.email || submitAttempted) && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-destructive">
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
                className="text-destructive text-[11px] mt-1 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-password" className="block text-xs font-semibold text-foreground">
              Create Password <span className="text-destructive">*</span>
            </label>
            {formData.password && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                strength.score === 1
                  ? 'bg-destructive/15 text-destructive'
                  : strength.score === 2
                  ? 'bg-warning/15 text-warning'
                  : 'bg-success/15 text-success'
              }`}>
                {strength.label}
              </span>
            )}
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
              errors.password && (touched.password || submitAttempted)
                ? 'text-destructive'
                : 'text-muted-foreground group-focus-within:text-primary'
            }`}>
              <Lock className="w-4 h-4" />
            </div>
            <input
              ref={passwordRef}
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Create strong password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password && (touched.password || submitAttempted))}
              className={`w-full pl-10 pr-20 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 transition-all outline-none ${
                errors.password && (touched.password || submitAttempted)
                  ? 'border border-destructive bg-destructive/[0.03] ring-2 ring-destructive/15 focus:ring-destructive/25'
                  : isPasswordValid
                  ? 'border border-success/60 bg-background/80 ring-1 ring-success/20'
                  : 'border border-border/80 bg-background/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-ring/20'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
              {isPasswordValid && (
                <span className="text-success pointer-events-none">
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

          {/* Password Dynamic Strength Progress Bar */}
          {formData.password && (
            <div className="mt-1.5 flex items-center gap-1">
              <div
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  strength.score >= 1 ? strength.color : 'bg-muted'
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  strength.score >= 2 ? strength.color : 'bg-muted'
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  strength.score >= 3 ? strength.color : 'bg-muted'
                }`}
              />
            </div>
          )}

          {/* Realtime Password Rules Checklist (Standard on top-tier apps) */}
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
              hasMinLength ? 'text-success' : 'text-muted-foreground/70'
            }`}>
              <Check className={`w-3 h-3 ${hasMinLength ? 'text-success stroke-[2.5]' : 'opacity-30'}`} />
              8+ chars
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
              hasUppercase ? 'text-success' : 'text-muted-foreground/70'
            }`}>
              <Check className={`w-3 h-3 ${hasUppercase ? 'text-success stroke-[2.5]' : 'opacity-30'}`} />
              1 uppercase
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
              hasNumberOrSpecial ? 'text-success' : 'text-muted-foreground/70'
            }`}>
              <Check className={`w-3 h-3 ${hasNumberOrSpecial ? 'text-success stroke-[2.5]' : 'opacity-30'}`} />
              Number/symbol
            </span>
          </div>

          <AnimatePresence>
            {errors.password && (touched.password || submitAttempted) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-destructive text-[11px] mt-1.5 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            {isConfirmValid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <Check className="w-3 h-3" /> Passwords match
              </span>
            )}
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
              errors.confirmPassword && (touched.confirmPassword || submitAttempted)
                ? 'text-destructive'
                : 'text-muted-foreground group-focus-within:text-primary'
            }`}>
              <Lock className="w-4 h-4" />
            </div>
            <input
              ref={confirmPasswordRef}
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm your password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword && (touched.confirmPassword || submitAttempted))}
              className={`w-full pl-10 pr-20 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 transition-all outline-none ${
                errors.confirmPassword && (touched.confirmPassword || submitAttempted)
                  ? 'border border-destructive bg-destructive/[0.03] ring-2 ring-destructive/15 focus:ring-destructive/25'
                  : isConfirmValid
                  ? 'border border-success/60 bg-background/80 ring-1 ring-success/20'
                  : 'border border-border/80 bg-background/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-ring/20'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
              {isConfirmValid && (
                <span className="text-success pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (touched.confirmPassword || submitAttempted) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-destructive text-[11px] mt-1 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              ref={termsRef}
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
              className={`mt-0.5 w-4 h-4 rounded border text-primary focus:ring-ring/30 accent-primary transition-all ${
                errors.agreedToTerms && (touched.agreedToTerms || submitAttempted)
                  ? 'border-destructive ring-2 ring-destructive/20'
                  : 'border-border'
              }`}
            />
            <span className="text-[11px] text-muted-foreground leading-snug">
              I agree to CeylonTour&apos;s{' '}
              <span className="text-foreground font-medium hover:underline">
                Sustainable Travel Code
              </span>{' '}
              and Terms of Service.
            </span>
          </label>
          <AnimatePresence>
            {errors.agreedToTerms && (touched.agreedToTerms || submitAttempted) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-destructive text-[11px] mt-1 font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.agreedToTerms}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:opacity-95 text-primary-foreground font-bold text-sm py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Traveler Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="mt-4 pt-3.5 border-t border-border/70 text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer ml-0.5"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

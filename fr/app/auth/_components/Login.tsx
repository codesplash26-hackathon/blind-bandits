'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, Eye as EyeIcon, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export default function Login({ onSwitchToSignup }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Please enter a valid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        toast.success(`Welcome back!`, {
          description: `Logged in as ${values.email}. Redirecting...`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        });
        setTimeout(() => {
          router.push('/');
        }, 700);
      }, 850);
    },
  });

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
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              {...formik.getFieldProps('email')}
              placeholder="you@domain.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/80 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none ${
                formik.touched.email && formik.errors.email
                  ? 'border-destructive ring-1 ring-destructive'
                  : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-destructive text-xs mt-1 font-medium">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={() => toast.info('Password reset instructions sent to your registered email.')}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              {...formik.getFieldProps('password')}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-background/80 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none ${
                formik.touched.password && formik.errors.password
                  ? 'border-destructive ring-1 ring-destructive'
                  : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-destructive text-xs mt-1 font-medium">{formik.errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...formik.getFieldProps('rememberMe')}
              checked={formik.values.rememberMe}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-[#44A6B5]"
            />
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Keep me signed in on this device
            </span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to CeylonTour</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="mt-6 pt-5 border-t border-border/70 text-center">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
}

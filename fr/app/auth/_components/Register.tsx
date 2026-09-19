'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Mail,
  Lock,
  User,
  Eye as EyeIcon,
  EyeOff,
  ArrowRight,
  Compass,
  Home,
  Trees,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const ROLES = [
  {
    id: 'TRAVELER',
    label: 'Traveler',
    subtitle: 'Explore authentic routes',
    icon: Compass,
  },
  {
    id: 'LOCAL_HOST',
    label: 'Local Host',
    subtitle: 'Homestays & native tours',
    icon: Home,
  },
  {
    id: 'CONSERVATION_PARTNER',
    label: 'Eco Partner',
    subtitle: 'Wildlife & reforestation',
    icon: Trees,
  },
];

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      role: 'TRAVELER',
      agreedToTerms: true,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      role: Yup.string().required('Please select an account type'),
      agreedToTerms: Yup.boolean().oneOf([true], 'You must accept the terms'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        toast.success(`Account created successfully!`, {
          description: `Welcome to CeylonTour, ${values.username}!`,
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
      <div className="mb-5 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Create Account
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 leading-relaxed">
          Join conscious travelers & certified local hosts across Sri Lanka.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={formik.handleSubmit} className="space-y-3.5">
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            I am joining as:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = formik.values.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => formik.setFieldValue('role', r.id)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                      : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-primary/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-1 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isSelected ? 'text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {r.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {r.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              {...formik.getFieldProps('username')}
              placeholder="e.g. Amaya Perera"
              className={`w-full pl-10 pr-4 py-2 rounded-xl bg-background/80 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none ${
                formik.touched.username && formik.errors.username
                  ? 'border-destructive ring-1 ring-destructive'
                  : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />
          </div>
          {formik.touched.username && formik.errors.username && (
            <p className="text-destructive text-xs mt-0.5 font-medium">{formik.errors.username}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
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
              className={`w-full pl-10 pr-4 py-2 rounded-xl bg-background/80 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none ${
                formik.touched.email && formik.errors.email
                  ? 'border-destructive ring-1 ring-destructive'
                  : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-destructive text-xs mt-0.5 font-medium">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Create Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              {...formik.getFieldProps('password')}
              placeholder="At least 6 characters"
              className={`w-full pl-10 pr-11 py-2 rounded-xl bg-background/80 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none ${
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
            <p className="text-destructive text-xs mt-0.5 font-medium">{formik.errors.password}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...formik.getFieldProps('agreedToTerms')}
              checked={formik.values.agreedToTerms}
              className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-[#44A6B5]"
            />
            <span className="text-[11px] text-muted-foreground leading-snug">
              I agree to CeylonTour&apos;s{' '}
              <span className="text-primary font-medium hover:underline">
                Sustainable Travel Code
              </span>{' '}
              and Terms of Service.
            </span>
          </label>
          {formik.touched.agreedToTerms && formik.errors.agreedToTerms && (
            <p className="text-destructive text-xs mt-0.5 font-medium">{formik.errors.agreedToTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <span>Create CeylonTour Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="mt-5 pt-4 border-t border-border/70 text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

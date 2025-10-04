'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for error in URL params (e.g., from invalid org redirect)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'OrgNotFound') {
      setError('Your organization no longer exists. Please sign in again.');
    } else if (urlError === 'SessionInvalid') {
      setError('Your session is invalid. This can happen after a database reset or if you were removed from the organization. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    // Get fresh session to check user role
    const session = await getSession();
    const isSuperAdmin = (session?.user as any)?.isSuperAdmin;
    
    // Redirect based on user type
    router.push(isSuperAdmin ? '/admin' : '/dashboard');
  };

  return (
    <div className="admin-layout min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="admin-brand-gradient inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white font-bold text-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-200">
            CF
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            CleanFlow
          </h1>
          <p className="text-sm">
            Complete Business Management for Cleaning Services
          </p>
        </div>

        {/* Sign In Card */}
        <div className="admin-bg rounded-2xl shadow-xl overflow-hidden border admin-border">
          <div className="px-8 py-10">
            <h2 className="text-2xl font-bold text-center mb-8">
              Sign in to your account
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 admin-text-tertiary" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="admin-input block w-full pl-10 pr-3 py-3 rounded-lg"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 admin-text-tertiary" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="admin-input block w-full pl-10 pr-3 py-3 rounded-lg"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="admin-error-message flex items-center gap-2 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="admin-link text-sm font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="admin-brand-gradient w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-transparent"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="admin-bg-secondary px-8 py-4 border-t admin-border">
            <p className="text-xs text-center">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="admin-link font-medium"
              >
                Contact us to get started
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="admin-text-tertiary mt-8 text-center text-xs">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="admin-link underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="admin-link underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="admin-layout min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
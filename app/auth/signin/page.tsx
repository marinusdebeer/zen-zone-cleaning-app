'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
      setError('Invalid credentials');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] rounded-2xl text-white font-bold text-3xl mb-4 shadow-xl">
            CF
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CleanFlow</h1>
          <p className="text-gray-600">Complete Business Management for Cleaning Services</p>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-3 mt-4">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot your password?
            </Link>
            
            <div className="text-xs text-gray-600 space-y-2 pt-4 border-t border-gray-200">
              <p className="font-semibold text-gray-700">Demo Accounts:</p>
              <div className="bg-blue-50 p-2 rounded">
                <p className="font-medium">🛡️ Super Admin:</p>
                <p>marinusdebeer@gmail.com / password123</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="font-medium">👤 Zen Zone Admin:</p>
                <p>admin@zenzonecleaning.com / password123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

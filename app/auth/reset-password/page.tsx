'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/server/actions/password-reset';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    if (!emailParam || !tokenParam) {
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new password reset.' });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await resetPassword(email, token, newPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 12) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faf7] to-[#e8f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2e3d2f] to-[#4a7c59] rounded-2xl shadow-lg mb-4">
            <span className="text-white text-3xl font-bold">ZZ</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
          <p className="text-gray-600">Enter a strong password for your account</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              )}
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          )}

          {email && token ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Resetting password for:</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              {/* New Password Input */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${strength.color}`}
                          style={{ width: `${(strength.strength / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{strength.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 8 characters required</p>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                  placeholder="Confirm new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !token || newPassword !== confirmPassword}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg font-semibold hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg font-semibold hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all shadow-lg"
              >
                Request New Link
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}

          {/* Back to Sign In */}
          {email && token && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-[#4a7c59] hover:text-[#4a8c37] font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Contact <a href="mailto:support@cleanflow.com" className="text-[#4a7c59] hover:text-[#4a8c37] font-medium">support@cleanflow.com</a></p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f7faf7] to-[#e8f0e8] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

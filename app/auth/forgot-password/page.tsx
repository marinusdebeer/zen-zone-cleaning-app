import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faf7] to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2e3d2f] to-[#4a7c59] rounded-2xl text-white font-bold text-2xl mb-4">
            ZZ
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2 text-[#4a7c59]" />
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4a8c37] text-white py-3 rounded-xl hover:bg-[#4a7c59] transition-colors font-semibold shadow-lg"
            >
              Send Reset Link
            </button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-sm text-[#4a7c59] hover:text-[#4a8c37]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Password reset functionality is coming soon. 
              For now, contact your organization admin or marinusdebeer@gmail.com for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

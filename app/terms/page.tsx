import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="admin-layout min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/auth/signin"
          className="admin-link inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="admin-card overflow-hidden">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold mb-2">
              Terms of Service
            </h1>
            <p className="text-sm admin-text-tertiary mb-8">
              Last updated: September 30, 2025
            </p>

            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using CleanFlow, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                2. Use License
              </h2>
              <p className="mb-4">
                Permission is granted to temporarily access CleanFlow for personal or commercial use. This is the grant of a license, not a transfer of title.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                3. Service Description
              </h2>
              <p className="mb-4">
                CleanFlow provides business management software for cleaning service companies, including client management, job scheduling, invoicing, and payment processing.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                4. User Responsibilities
              </h2>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                5. Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at support@cleanflow.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

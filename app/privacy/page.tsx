import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm admin-text-tertiary mb-8">
              Last updated: September 30, 2025
            </p>

            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-4">
                1. Information We Collect
              </h2>
              <p className="mb-4">
                We collect information that you provide directly to us, including your name, email address, phone number, and business information when you create an account or use our services.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you technical notices and support messages, and to communicate with you about products, services, and events.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                3. Information Sharing
              </h2>
              <p className="mb-4">
                We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                4. Data Security
              </h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                5. Your Rights
              </h2>
              <p className="mb-4">
                You have the right to access, update, or delete your personal information at any time. You can also opt out of receiving promotional communications from us.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">
                6. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at privacy@cleanflow.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

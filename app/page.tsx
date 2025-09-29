import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  // If user is logged in and has a selected org, redirect to their dashboard
  if (session?.selectedOrgSlug) {
    redirect(`/t/${session.selectedOrgSlug}/dashboard`);
  }

  // If user is logged in but no org selected, show org selection (future feature)
  // For now, redirect to demo org
  if (session?.user) {
    redirect("/t/zenzone/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Zen Zone Cleaning
            <span className="block text-3xl font-normal text-gray-600 mt-2">
              Multi-Tenant SaaS Platform
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A complete business management solution for cleaning services with 
            multi-tenant architecture, custom workflows, and enterprise-grade security.
          </p>
        </header>

        {/* Demo Access */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Demo Access
          </h2>
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center block transition-colors"
            >
              Sign In to Demo
            </Link>
            <div className="text-sm text-gray-600 text-center">
              <p><strong>Email:</strong> owner@zenzonecleaning.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">🏢 Multi-Tenant</h3>
            <p className="text-gray-600">
              Complete data isolation with tenant-specific themes, workflows, and configurations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">🔒 Enterprise Security</h3>
            <p className="text-gray-600">
              Row Level Security, authentication, and role-based access control built-in.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ Production Ready</h3>
            <p className="text-gray-600">
              Built with Next.js 14, TypeScript, Prisma, and PostgreSQL for scale.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Built With</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full shadow">Next.js 14</span>
            <span className="bg-white px-3 py-1 rounded-full shadow">TypeScript</span>
            <span className="bg-white px-3 py-1 rounded-full shadow">Prisma ORM</span>
            <span className="bg-white px-3 py-1 rounded-full shadow">PostgreSQL</span>
            <span className="bg-white px-3 py-1 rounded-full shadow">Auth.js</span>
            <span className="bg-white px-3 py-1 rounded-full shadow">Tailwind CSS</span>
            <span className="bg-white px-3 py-1 rounded-full shadow">Vercel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/ui/components/session-provider";
import { AdminHeader } from "@/ui/components/admin-header";
import Link from 'next/link';
import { Building, BarChart3, Settings, BookOpen } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if super admin
  const user = session.user as any;
  if (!user.isSuperAdmin) {
    redirect('/dashboard');
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Admin Header */}
        <AdminHeader />

        {/* Admin Navigation */}
        <nav className="bg-[#1e40af] border-b border-blue-800">
          <div className="px-6">
            <div className="flex space-x-1">
              <Link
                href="/admin"
                className="px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-800 rounded-t-lg transition-colors"
              >
                <Building className="w-4 h-4 inline mr-2" />
                Organizations
              </Link>
              <Link
                href="/admin/analytics"
                className="px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-800 rounded-t-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </Link>
              <Link
                href="/admin/docs"
                className="px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-800 rounded-t-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Docs
              </Link>
              <Link
                href="/admin/settings"
                className="px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-800 rounded-t-lg transition-colors"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}

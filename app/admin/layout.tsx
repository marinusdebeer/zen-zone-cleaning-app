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
      <div className="admin-layout min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Admin Header */}
        <AdminHeader />

        {/* Admin Navigation */}
        <nav className="admin-nav">
          <div className="px-6">
            <div className="flex space-x-1">
              <Link href="/admin" className="admin-nav-link px-4 py-3 text-sm font-medium rounded-t-lg">
                <Building className="w-4 h-4 inline mr-2" />
                Organizations
              </Link>
              <Link href="/admin/analytics" className="admin-nav-link px-4 py-3 text-sm font-medium rounded-t-lg">
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </Link>
              <Link href="/admin/docs" className="admin-nav-link px-4 py-3 text-sm font-medium rounded-t-lg">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Docs
              </Link>
              <Link href="/admin/settings" className="admin-nav-link px-4 py-3 text-sm font-medium rounded-t-lg">
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

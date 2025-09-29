import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/ui/components/session-provider";
import { DashboardWrapper } from "@/ui/components/dashboard-wrapper";
import { prisma } from '@/server/db';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get organization from session
  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">No Organization Selected</h1>
          <p className="text-gray-600 mt-2">Please contact support</p>
        </div>
      </div>
    );
  }

  // Get org name for display
  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { name: true, slug: true }
  });

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Organization Not Found</h1>
          <p className="text-gray-600 mt-2">Please contact support</p>
        </div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <DashboardWrapper>
        {children}
      </DashboardWrapper>
    </SessionProvider>
  );
}

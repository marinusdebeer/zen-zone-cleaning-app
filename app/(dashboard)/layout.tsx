import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/ui/components/session-provider";
import { DashboardWrapper } from "@/ui/components/dashboard-wrapper";
import { SidebarProvider } from "@/ui/components/sidebar-context";
import { prisma } from "@/server/db";

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

  // Validate selected organization and user membership
  const selectedOrgId = (session as any).selectedOrgId;
  const userId = session.user.id;
  const isSuperAdmin = (session.user as any)?.isSuperAdmin;

  if (selectedOrgId && !isSuperAdmin) {
    // Check if user still has valid membership in the organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId: userId as string,
          orgId: selectedOrgId,
        },
      },
      include: {
        org: { select: { id: true, name: true } },
      },
    });

    // If no membership or org doesn't exist → invalid session
    if (!membership || !membership.org) {
      redirect('/auth/signin?error=SessionInvalid');
    }
  }

  return (
    <SidebarProvider>
      <SessionProvider>
        <div className="tenant-layout">
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </div>
      </SessionProvider>
    </SidebarProvider>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/ui/components/session-provider";
import { DashboardWrapper } from "@/ui/components/dashboard-wrapper";
import { SidebarProvider } from "@/ui/components/sidebar-context";

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

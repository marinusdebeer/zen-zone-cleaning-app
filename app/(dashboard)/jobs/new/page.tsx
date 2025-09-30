import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { JobWizard } from './job-wizard';

export default async function NewJobPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get clients with their properties
  const clients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    include: {
      properties: true,
    },
    orderBy: { name: 'asc' }
  });

  // Get team members
  const teamMembers = await prisma.membership.findMany({
    where: { orgId: selectedOrgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  // Get services from org settings
  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { settings: true }
  });

  const services = (org?.settings as any)?.services || [];

  return <JobWizard clients={clients} teamMembers={teamMembers} services={services} orgId={selectedOrgId} />;
}
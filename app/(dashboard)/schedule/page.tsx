import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { ScheduleClient } from "./schedule-client";

export default async function SchedulePage() {
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

  // Get organization to access services
  const organization = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: {
      settings: true,
    }
  });

  const services = (organization?.settings as any)?.services || [];

  // Get jobs for the calendar
  const jobs = await prisma.job.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: true,
      property: true,
      visits: {
        where: {
          status: {
            in: ['Scheduled', 'InProgress']
          }
        },
        orderBy: {
          scheduledAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transform jobs to calendar format
  const calendarJobs = jobs.flatMap(job => 
    job.visits.map(visit => ({
      id: visit.id,
      title: job.title,
      client: job.client.name,
      address: job.property?.address || 'No address',
      startTime: visit.scheduledAt,
      endTime: new Date(visit.scheduledAt.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours
      assignee: (visit.assignees as any[])?.[0] || 'Unassigned',
      status: visit.status === 'Scheduled' ? 'scheduled' : 
              visit.status === 'InProgress' ? 'in-progress' :
              visit.status === 'Completed' ? 'completed' : 'pending',
    }))
  );

  return (
    <ScheduleClient
      clients={clients}
      teamMembers={teamMembers}
      services={services}
      orgId={selectedOrgId}
      initialJobs={calendarJobs}
    />
  );
}
/**
 * SCHEDULE (CALENDAR) PAGE
 * Route: /schedule
 * 
 * Purpose:
 * - Display calendar view of ALL VISITS (not jobs)
 * - Show visit scheduling, team assignments, and invoice status
 * - Allow drag-and-drop rescheduling
 * 
 * Data Fetching:
 * - Fetches visits directly with job, client, property, invoice relations
 * - Each calendar event is a visit (click → /visits/[id])
 * - Fetches team members for filtering
 * 
 * Component:
 * - Renders ScheduleClient (client component with calendar)
 * 
 * Features:
 * - Month/week/day calendar views
 * - Click visit → View visit detail page
 * - Visit detail → Link to parent job
 * - Color-coded by visit status
 * - Shows invoice status on visits
 * 
 * Notes:
 * - Schedule shows VISITS (not jobs)
 * - One job can have multiple visits on calendar
 * - Clicking calendar event goes to /visits/[id]
 * - Visit page has link to job for editing
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { ScheduleClient } from "./schedule-client";
import { serialize } from "@/lib/serialization";
import { getClientDisplayName } from "@/lib/client-utils";

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
    orderBy: [
      { companyName: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ]
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

  // Get visits for the calendar (not jobs)
  const visits = await prisma.visit.findMany({
    where: { 
      orgId: selectedOrgId,
      status: {
        in: ['Scheduled', 'InProgress', 'Completed']
      }
    },
    include: {
      job: {
        include: {
          client: true,
          property: true,
        },
      },
      lineItems: {
        orderBy: { order: 'asc' },
      },
      invoice: {
        select: {
          id: true,
          number: true,
          status: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc'
    }
  });

  // Transform visits to calendar format with full visit data for modal
  const calendarJobs = visits.map(visit => {
    const status = visit.status === 'Scheduled' ? 'scheduled' : 
                   visit.status === 'InProgress' ? 'in-progress' :
                   visit.status === 'Completed' ? 'completed' : 'pending';
    
    // Serialize the visit data (includes Decimal fields)
    const serializedVisit = serialize({
      ...visit,
      job: visit.job,
    });
    
    const clientName = getClientDisplayName(visit.job.client);
    
    return {
      id: visit.id,
      jobId: visit.job.id,
      jobNumber: visit.job.number,
      title: visit.job.title || clientName,
      client: clientName,
      address: visit.job.property?.address || 'No address',
      startTime: visit.scheduledAt,
      endTime: new Date(visit.scheduledAt.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours
      assignee: (visit.assignees as any[])?.[0] || 'Unassigned',
      status: status as 'scheduled' | 'in-progress' | 'completed' | 'pending',
      visitStatus: visit.status,
      isInvoiced: !!visit.invoiceId,
      invoiceNumber: visit.invoice?.number,
      // Include serialized visit data for modal
      visitData: serializedVisit,
    };
  });

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
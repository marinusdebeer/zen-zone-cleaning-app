/**
 * TEAM MEMBERS PAGE
 * Route: /team
 * 
 * Purpose:
 * - Manage organization team members
 * - Invite new members
 * - Set roles and permissions
 * 
 * Data Fetching:
 * - Fetches team members via getTeamMembers() action
 * - Includes user details and role information
 * 
 * Component:
 * - Renders TeamClient (client component for team management)
 * 
 * Features:
 * - Invite new team members by email
 * - Assign roles (Admin, Manager, Technician)
 * - View team member activity
 * - Deactivate/remove members
 * 
 * Notes:
 * - Only admins can invite/remove members
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeamMembers } from "@/server/actions/team";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { memberships, orgName } = await getTeamMembers();
  const currentUserEmail = session.user.email || '';

  return <TeamClient memberships={memberships} orgName={orgName} currentUserEmail={currentUserEmail} />;
}
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
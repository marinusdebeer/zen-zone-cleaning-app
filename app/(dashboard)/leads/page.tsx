import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeads } from "@/server/actions/leads";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const leads = await getLeads();

  return <LeadsClient leads={leads} />;
}

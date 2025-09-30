import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrganizationSettings } from "@/server/actions/settings";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const organization = await getOrganizationSettings();
  const user = session.user;

  return (
    <SettingsClient 
      organization={organization}
      user={{
        name: user.name || '',
        email: user.email || '',
      }}
    />
  );
}
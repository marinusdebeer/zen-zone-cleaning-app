/**
 * ORGANIZATION SETTINGS PAGE
 * Route: /settings
 * 
 * Purpose:
 * - Configure organization settings
 * - Update business information
 * - Manage services and pricing
 * 
 * Data Fetching:
 * - Fetches organization settings via getOrganizationSettings()
 * - Includes org name, industry, timezone, services
 * 
 * Component:
 * - Renders SettingsClient (client component with form tabs)
 * 
 * Features:
 * - Organization tab: Name, industry, timezone
 * - Services tab: Available services and pricing
 * - Billing tab: Payment methods and invoicing
 * - Notifications tab: Email and alert preferences
 * 
 * Notes:
 * - Tabbed interface for different setting categories
 * - Auto-saves changes
 * - Theme-compliant design
 */

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
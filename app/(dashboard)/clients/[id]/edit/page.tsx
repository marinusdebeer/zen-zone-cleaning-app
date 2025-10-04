/**
 * EDIT CLIENT PAGE
 * Route: /clients/[id]/edit
 * 
 * Purpose:
 * Edit an existing client
 * 
 * Data Fetching:
 * - Fetches client by ID
 * 
 * Component:
 * - Renders ClientForm with existing client data
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch the client
  const client = await withOrgContext(selectedOrgId, async () => {
    return await prisma.client.findUnique({
      where: { id },
    });
  });

  if (!client) {
    return <div>Client not found</div>;
  }

  // Serialize for client component
  const serializedClient = serialize(client);

  return (
    <ClientForm 
      orgId={selectedOrgId}
      existingClient={serializedClient}
    />
  );
}


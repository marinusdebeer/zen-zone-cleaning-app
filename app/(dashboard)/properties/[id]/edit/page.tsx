/**
 * PROPERTY EDIT PAGE
 * Route: /properties/[id]/edit
 * 
 * Purpose:
 * Edit property details
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { PropertyEditForm } from "./property-edit-form";

export default async function PropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch property
  const property = await withOrgContext(selectedOrgId, async () => {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
  });

  if (!property) {
    redirect('/clients');
  }

  const serializedProperty = serialize(property);

  return (
    <PropertyEditForm 
      property={serializedProperty}
      orgId={selectedOrgId}
    />
  );
}


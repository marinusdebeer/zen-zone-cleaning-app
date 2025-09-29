import { notFound } from 'next/navigation';
import { getOrgBySlug } from '@/server/tenancy';
import { TenantLayout } from '@/ui/components/tenant-layout';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function SlugLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  
  if (!org) {
    notFound();
  }

  return <TenantLayout org={org}>{children}</TenantLayout>;
}

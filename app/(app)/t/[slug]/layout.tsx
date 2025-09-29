import { notFound } from 'next/navigation';
import { getOrgBySlug } from '@/server/tenancy';
import { TenantLayout } from '@/ui/components/tenant-layout';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function SlugLayout({ children, params }: TenantLayoutProps) {
  console.log('🔄 SlugLayout called with params:', params);
  
  const { slug } = await params;
  console.log('🔍 SlugLayout: slug extracted:', slug);
  
  const org = await getOrgBySlug(slug);
  console.log('🔍 SlugLayout: org fetched:', org ? 'SUCCESS' : 'NOT FOUND');
  
  if (!org) {
    console.log('❌ SlugLayout: Organization not found, calling notFound()');
    notFound();
  }

  console.log('✅ SlugLayout: Rendering TenantLayout with org:', org.name);
  return <TenantLayout org={org}>{children}</TenantLayout>;
}

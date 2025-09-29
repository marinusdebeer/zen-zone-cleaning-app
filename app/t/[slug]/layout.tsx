// TEMP DEBUG LAYOUT: bypass org lookup and TenantLayout to isolate routing
import { SessionProvider } from '@/ui/components/session-provider';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function SlugLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;
  console.log('🧭 DEBUG SlugLayout (bypass): slug =', slug);
  // Bypass DB and tenant layout completely to verify dynamic routing stability
  return (
    <SessionProvider>
      <div style={{padding:"12px", background:"#fff7d6", borderBottom:"1px solid #eedc9a", fontSize:"12px"}}>
        DEBUG: tenant slug = {slug} (temporary layout bypass)
      </div>
      {children}
    </SessionProvider>
  );
}

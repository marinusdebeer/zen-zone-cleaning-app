'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Organization } from '@/generated/prisma';

interface TenantLayoutProps {
  children: React.ReactNode;
  org: Organization;
}

export function TenantLayout({ children, org }: TenantLayoutProps) {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Apply theme CSS variables
  const settings = org.settings as Record<string, any>;
  const themeStyle = org.settings && typeof org.settings === 'object' && 'ui_prefs' in org.settings 
    ? {
        '--color-primary': settings.ui_prefs?.theme?.primary || '#2E3D2F',
        '--color-accent': settings.ui_prefs?.theme?.accent || '#78A265',
        '--color-surface': settings.ui_prefs?.theme?.surface || '#FAFFFA',
        '--color-cta': settings.ui_prefs?.theme?.cta || '#6B5B95',
      } as React.CSSProperties
    : {};

  const navigation = [
    { name: 'Dashboard', href: `/t/${org.slug}/dashboard` },
    { name: 'Clients', href: `/t/${org.slug}/clients` },
    { name: 'Jobs', href: `/t/${org.slug}/jobs` },
    { name: 'Invoices', href: `/t/${org.slug}/invoices` },
  ];

  return (
    <div style={themeStyle} className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-[color:var(--color-primary)]">
                  {org.name}
                </h1>
              </div>
              <div className="ml-6 flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-[color:var(--color-primary)] px-3 py-2 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.name}
              </span>
              <button
                onClick={() => {/* TODO: implement signout */}}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}


import { getOrgBySlug } from '@/server/tenancy';

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  console.log('🔍 Dashboard page rendering, params:', params);
  
  try {
    const { slug } = await params;
    console.log('🔍 Slug extracted:', slug);
    
    const org = await getOrgBySlug(slug);
    console.log('🔍 Organization fetched:', org ? 'SUCCESS' : 'NOT FOUND');

    if (!org) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Organization not found</h1>
            <p className="text-gray-600 mt-2">Slug: {slug}</p>
            <p className="text-sm text-gray-500 mt-4">Check your database connection and seeded data</p>
          </div>
        </div>
      );
    }

    const settings = org.settings as any;
    const theme = settings?.ui_prefs?.theme;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to {org.name}
          </h1>
          <p className="text-gray-600">
            Industry: {org.industry}
          </p>
        </div>

        {/* Theme demonstration */}
        {theme && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Theme Colors
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded mx-auto mb-2"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <p className="text-sm">Primary</p>
                <p className="text-xs text-gray-500">{theme.primary}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded mx-auto mb-2"
                  style={{ backgroundColor: theme.accent }}
                ></div>
                <p className="text-sm">Accent</p>
                <p className="text-xs text-gray-500">{theme.accent}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded mx-auto mb-2 border"
                  style={{ backgroundColor: theme.surface }}
                ></div>
                <p className="text-sm">Surface</p>
                <p className="text-xs text-gray-500">{theme.surface}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded mx-auto mb-2"
                  style={{ backgroundColor: theme.cta }}
                ></div>
                <p className="text-sm">CTA</p>
                <p className="text-xs text-gray-500">{theme.cta}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a 
                href={`/t/${slug}/clients`}
                className="block text-blue-600 hover:text-blue-800"
              >
                Manage Clients
              </a>
              <a 
                href={`/t/${slug}/jobs/new`}
                className="block text-blue-600 hover:text-blue-800"
              >
                Create New Job
              </a>
              <a 
                href={`/t/${slug}/jobs`}
                className="block text-blue-600 hover:text-blue-800"
              >
                View All Jobs
              </a>
              <a 
                href={`/t/${slug}/invoices`}
                className="block text-blue-600 hover:text-blue-800"
              >
                View Invoices
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Organization Info
            </h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {org.name}</p>
              <p><strong>Slug:</strong> {org.slug}</p>
              <p><strong>Industry:</strong> {org.industry}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Features
            </h3>
            <div className="space-y-2">
              {settings?.features && Object.entries(settings.features).map(([key, enabled]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}</span>
                  <span className={enabled ? 'text-green-600' : 'text-gray-400'}>
                    {enabled ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('🚨 Dashboard page error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
          <p className="text-gray-600 mt-2">Check console for details</p>
          <p className="text-sm text-gray-500 mt-4">{String(error)}</p>
        </div>
      </div>
    );
  }
}
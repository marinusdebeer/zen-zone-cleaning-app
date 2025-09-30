import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { readFile } from 'fs/promises';
import path from 'path';
import { MarkdownViewer } from '@/ui/components/markdown-viewer';

// Map slugs to actual file names
const slugToFile: Record<string, string> = {
  'email-setup': 'EMAIL_SETUP.md',
  'admin-guide': 'ADMIN_GUIDE.md',
  'user-accounts': 'USER_ACCOUNTS.md',
  'business-workflow': 'BUSINESS_WORKFLOW.md',
  'multi-tenancy': 'MULTI_TENANCY.md',
  'calendar-features': 'CALENDAR_FEATURES.md',
  'how-to-run': 'HOW_TO_RUN.md',
  'adding-businesses': 'ADDING_BUSINESSES.md',
  'calendar-usage': 'CALENDAR_USAGE.md',
  'cleanflow-branding': 'CLEANFLOW_BRANDING.md',
  'drag-to-create': 'DRAG_TO_CREATE_GUIDE.md',
  'navigation-flow': 'NAVIGATION_FLOW.md',
  'test-data': 'TEST_DATA.md',
};

const slugToTitle: Record<string, string> = {
  'email-setup': 'Email Setup Guide',
  'admin-guide': 'Admin Guide',
  'user-accounts': 'User Accounts',
  'business-workflow': 'Business Workflow',
  'multi-tenancy': 'Multi-Tenancy Architecture',
  'calendar-features': 'Calendar Features',
  'how-to-run': 'How to Run',
  'adding-businesses': 'Adding Businesses',
  'calendar-usage': 'Calendar Usage',
  'cleanflow-branding': 'CleanFlow Branding',
  'drag-to-create': 'Drag to Create Guide',
  'navigation-flow': 'Navigation Flow',
  'test-data': 'Test Data',
};

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  
  if (!session?.user) redirect('/auth/signin');
  
  const user = session.user as any;
  if (!user.isSuperAdmin) redirect('/dashboard');

  const { slug } = await params;
  
  const fileName = slugToFile[slug];
  const title = slugToTitle[slug];

  if (!fileName || !title) {
    redirect('/admin/docs');
  }

  let content = '';
  try {
    const filePath = path.join(process.cwd(), 'docs', fileName);
    content = await readFile(filePath, 'utf-8');
  } catch (error) {
    content = '# Documentation Not Found\n\nThis documentation file could not be loaded.';
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/docs"
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Docs
        </Link>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <FileText className="w-4 h-4" />
          <span className="font-mono">{fileName}</span>
        </div>
      </div>

      {/* Document */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {/* Document Header */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-400" />
            {title}
          </h1>
        </div>

        {/* Document Content */}
        <div className="p-8">
          <MarkdownViewer content={content} />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Need help?</p>
            <p className="text-white font-medium">Check out the other documentation guides</p>
          </div>
          <Link
            href="/admin/docs"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            View All Docs
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

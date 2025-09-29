'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardButtonProps {
  className?: string;
}

export function DashboardButton({ className }: DashboardButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    console.log('Dashboard button clicked');
    
    try {
      // Try Next.js router first
      router.push('/t/zenzone/dashboard');
    } catch (error) {
      console.error('Router navigation failed:', error);
      // Fallback to direct navigation
      window.location.href = '/t/zenzone/dashboard';
    }
  };

  return (
    <div className="space-y-2">
      {/* Primary Link approach */}
      <Link
        href="/t/zenzone/dashboard"
        className={className}
        onClick={(e) => {
          console.log('Dashboard Link clicked');
        }}
      >
        Go to Dashboard
      </Link>
      
      {/* Test Routes */}
      <Link
        href="/t/zenzone/test"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-center block text-sm"
        onClick={() => console.log('Test route clicked')}
      >
        🧪 Test Route
      </Link>
      
      <Link
        href="/t/zenzone/simple-dashboard"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded text-center block text-sm"
        onClick={() => console.log('Simple dashboard clicked')}
      >
        📊 Simple Dashboard
      </Link>
      
      {/* Fallback button */}
      <button
        onClick={handleClick}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-4 rounded text-center block text-xs"
        title="Fallback navigation"
      >
        🔄 Force Navigate
      </button>
    </div>
  );
}

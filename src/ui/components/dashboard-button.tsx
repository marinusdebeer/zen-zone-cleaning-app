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
    <>
      {/* Primary Link approach */}
      <Link
        href="/t/zenzone/dashboard"
        className={className}
        onClick={(e) => {
          console.log('Link clicked');
        }}
      >
        Go to Dashboard
      </Link>
      
      {/* Fallback button */}
      <button
        onClick={handleClick}
        className={`${className} mt-2 opacity-0 hover:opacity-100 transition-opacity`}
        title="Fallback navigation"
      >
        Alternative Dashboard Link
      </button>
    </>
  );
}

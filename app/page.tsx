import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // If user is logged in, redirect based on role
  if (session?.user) {
    const user = session.user as any;
    
    // Super admins go to admin dashboard
    if (user.isSuperAdmin) {
      redirect('/admin');
    }
    
    // Regular users go to their organization dashboard
    redirect('/dashboard');
  }

  // If not logged in, redirect to sign in
  redirect('/auth/signin');
}

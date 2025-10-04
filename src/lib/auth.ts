/**
 * AUTH HELPER
 * 
 * Purpose:
 * Simple wrapper for getting server session.
 * 
 * Usage:
 * const session = await auth();
 * if (!session?.user) redirect('/auth/signin');
 */

import { getServerSession, Session } from "next-auth";
import { authConfig } from "@/server/auth";

export async function auth(): Promise<Session | null> {
  const session = await getServerSession(authConfig);
  return session;
}

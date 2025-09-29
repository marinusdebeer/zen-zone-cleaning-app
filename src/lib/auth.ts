import { getServerSession, Session } from "next-auth";
import { authConfig } from "@/server/auth";

export async function auth(): Promise<Session | null> {
  const session = await getServerSession(authConfig);
  return session;
}

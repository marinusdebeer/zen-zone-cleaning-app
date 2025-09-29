import { getServerSession } from "next-auth";
import { authConfig } from "@/server/auth";

export async function auth() {
  const session = await getServerSession(authConfig);
  return session as any; // Type assertion to handle complex NextAuth types
}

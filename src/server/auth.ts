import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { getUserOrganizations } from "./tenancy";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.userId = user.id;
        
        // Get all organizations this user belongs to
        // Supports multi-business: users can be members of multiple organizations
        const orgs = await getUserOrganizations(user.id);
        
        // Auto-select organization if user only belongs to one
        // For users with multiple orgs, they'll need to select via UI
        if (orgs.length === 1) {
          token.selectedOrgId = orgs[0].id;
          token.selectedOrgSlug = orgs[0].slug;
          token.userRole = orgs[0].memberships[0]?.role;
        } else if (orgs.length > 1 && !token.selectedOrgId) {
          // Default to first org if multiple exist and none selected
          // TODO: Add org switcher UI for multi-org users
          token.selectedOrgId = orgs[0].id;
          token.selectedOrgSlug = orgs[0].slug;
          token.userRole = orgs[0].memberships[0]?.role;
        }
        
        // Store all organizations in session for future org switching
        token.userOrgs = orgs.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          role: org.memberships[0]?.role,
        }));
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
        },
        selectedOrgId: token.selectedOrgId as string | undefined,
        selectedOrgSlug: token.selectedOrgSlug as string | undefined,
        userRole: token.userRole as string | undefined,
        userOrgs: token.userOrgs as Array<{
          id: string;
          name: string;
          slug: string;
          role: string;
        }>,
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
} as AuthOptions;

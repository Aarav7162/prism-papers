import { createClient } from "@supabase/supabase-js";
import { prisma } from "./prisma";
import { env } from "./env";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

// Optional Supabase admin client for server-side token verification and user management
export const supabaseAdmin =
  env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

/**
 * Extracts and verifies the authenticated user from the Request headers or cookies.
 * Supports:
 * 1. Bearer JWT tokens from Supabase Auth (Authorization: Bearer <jwt>)
 * 2. Supabase auth cookies via Authorization / Cookie header
 * 3. Fallback header for testing/development environments (x-user-id or x-user-email)
 * 4. Ensures the user record exists in the local Prisma database.
 */
export async function getAuthenticatedUser(
  request?: Request
): Promise<AuthenticatedUser | null> {
  if (!request) {
    return null;
  }

  // 1. Check for development / testing header override
  const devUserId = request.headers.get("x-user-id");
  const devUserEmail = request.headers.get("x-user-email");

  if (devUserId && devUserEmail) {
    const user = await prisma.user.upsert({
      where: { id: devUserId },
      update: { email: devUserEmail },
      create: {
        id: devUserId,
        email: devUserEmail,
        name: "Dev User",
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  // 2. Check Authorization Bearer Token
  const authHeader = request.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (token && supabaseAdmin) {
    try {
      const {
        data: { user: sbUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (!error && sbUser && sbUser.email) {
        // Upsert user to Prisma database so foreign keys stay consistent
        const user = await prisma.user.upsert({
          where: { email: sbUser.email },
          update: {
            name:
              (sbUser.user_metadata?.full_name as string) ||
              (sbUser.user_metadata?.name as string) ||
              undefined,
          },
          create: {
            id: sbUser.id,
            email: sbUser.email,
            name:
              (sbUser.user_metadata?.full_name as string) ||
              (sbUser.user_metadata?.name as string) ||
              null,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    } catch (err) {
      console.warn("Failed to verify Supabase token via admin client:", err);
    }
  }

  // 3. Fallback to default user in development mode for easy manual testing
  if (process.env.NODE_ENV === "development") {
    let demoUser = await prisma.user.findFirst();
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: "student@prism.test",
          name: "PRISM Scholar",
        },
      });
    }
    return {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    };
  }

  return null;
}


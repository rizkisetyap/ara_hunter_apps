import { cookies } from "next/headers";

export async function verifyAuthToken(request?: Request): Promise<boolean> {
  // Check headers if request is provided (for API routes using x-auth-token or authorization)
  if (request) {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-auth-token");
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
      const expectedUsername = process.env.ADMIN_USERNAME || "admin";
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        if (decoded.startsWith(`${expectedUsername}:`)) {
          return true;
        }
      } catch {
        // Invalid base64 or format
      }
    }
  }

  // Check cookies as fallback / for server components
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return false;

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    if (decoded.startsWith(`${expectedUsername}:`)) {
      return true;
    }
  } catch {
    // cookies() might not be available or throw outside request scope
  }

  return false;
}

import { createServerClient } from "@supabase/ssr";
import { createClient as createStandardClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// 1. Client untuk User (Tunduk pada RLS, menggunakan Cookie)
export async function createClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // Hanya abaikan jika dijalankan di Server Component
          // Console log ini membantu debugging jika error disebabkan hal lain
          if (process.env.NODE_ENV === 'development') {
             console.warn("Failed to set cookies:", error);
          }
        }
      },
    },
  });
}

// 2. Client untuk Admin (Bypass RLS, Stateless, Tanpa Cookie)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  // Menggunakan createClient standar dari @supabase/supabase-js
  return createStandardClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
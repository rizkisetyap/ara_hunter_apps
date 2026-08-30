import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    // Memberikan pesan error spesifik di console browser, 
    // bukan membiarkan aplikasi crash karena 'undefined'
    throw new Error(
      "Client Supabase gagal diinisialisasi: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan."
    );
  }

  return createBrowserClient(supabaseUrl, anonKey);
}
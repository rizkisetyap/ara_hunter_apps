import { createAdminClient } from "@/lib/supabase/server";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmitensClient from "./EmitensClient";

// Revalidate every 60 seconds (SSG with ISR / incremental static regeneration)
export const revalidate = 60;

export default async function EmitensDashboardPage() {
  let initialEmitens = [];
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase.from("emitens").select("*").order("symbol");
    initialEmitens = data || [];
  } catch (err) {
    console.error("Error fetching initial emitens:", err);
  }

  return (
    <ProtectedRoute>
      <EmitensClient initialEmitens={initialEmitens} />
    </ProtectedRoute>
  );
}
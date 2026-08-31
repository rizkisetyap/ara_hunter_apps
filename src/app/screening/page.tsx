import { createAdminClient } from "@/lib/supabase/server";
import ScreeningClient from "./ScreeningClient";

export const revalidate = 60;

export default async function ScreeningPage() {
  let initialData: Array<Record<string, unknown>> = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("screening_batches")
      .select("*")
      .order("screening_date", { ascending: false })
      .limit(50);
    initialData = data || [];
  } catch (err) {
    console.error("Error fetching initial screening data:", err);
  }

  return <ScreeningClient initialData={initialData} />;
}

import { createAdminClient } from "@/lib/supabase/server";
import ScreeningClient from "./ScreeningClient";

export const revalidate = 60;

interface EmitenOption {
  symbol: string;
  name: string;
}

export default async function ScreeningPage() {
  let initialData: Array<Record<string, unknown>> = [];
  let symbolOptions: EmitenOption[] = [];

  try {
    const supabase = createAdminClient();

    // Fetch emiten options directly from server-side Supabase
    const { data: emitenData } = await supabase
      .from("emitens")
      .select("symbol, name")
      .eq("is_active", true)
      .order("symbol");

    symbolOptions = (emitenData || []).map((item) => ({
      symbol: item.symbol,
      name: item.name,
    }));

    // Fetch screening data
    const { data: screeningData } = await supabase
      .from("screening_batches")
      .select("*")
      .order("screening_date", { ascending: false })
      .limit(50);

    initialData = screeningData || [];
  } catch (err) {
    console.error("Error fetching initial screening data:", err);
  }

  return (
    <ScreeningClient
      initialData={initialData}
      symbolOptions={symbolOptions}
    />
  );
}

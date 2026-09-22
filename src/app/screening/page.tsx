import { createAdminClient } from "@/lib/supabase/server";
import ScreeningClient from "./ScreeningClient";

export const dynamic = "force-dynamic";

interface EmitenOption {
  symbol: string;
  name: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default async function ScreeningPage() {
  let initialData: Array<Record<string, unknown>> = [];
  let symbolOptions: EmitenOption[] = [];
  let initialPagination: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };
  const initialFilters = { symbols: [] as string[], date: "" };

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

    // Fetch paginated screening data (first page with 10 items)
    const { data: screeningData, count } = await supabase
      .from("screening_batches")
      .select("*", { count: "exact" })
      .order("screening_date", { ascending: false })
      .range(0, 9); // First 10 items

    initialData = screeningData || [];
    initialPagination = {
      page: 1,
      limit: 10,
      total: count || 0,
      totalPages: count ? Math.ceil(count / 10) : 0,
    };
  } catch (err) {
    console.error("Error fetching initial screening data:", err);
  }

  return (
    <ScreeningClient
      initialData={initialData}
      symbolOptions={symbolOptions}
      initialPagination={initialPagination}
      initialFilters={initialFilters}
    />
  );
}

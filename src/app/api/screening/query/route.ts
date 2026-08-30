import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  try {
    const supabase = await createAdminClient();

    let query = supabase
      .from("screening_batches")
      .select("*")
      .order("screening_date", { ascending: false })
      .limit(50);

    if (symbol) {
      query = query.ilike("symbol", `%${symbol}%`);
    }

    if (date) {
      query = query.eq("screening_date", date);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

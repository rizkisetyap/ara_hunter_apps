import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.ARA_HUNTER_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase service role key" }, { status: 500 });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("emitens")
      .select("symbol, name")
      .eq("is_active", true)
      .order("symbol");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return structured options for dropdown
    const emitensOptions = (data || []).map((item) => ({
      symbol: item.symbol,
      name: item.name,
    }));

    return NextResponse.json(emitensOptions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

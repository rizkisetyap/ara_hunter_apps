import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: Request) {
  // Check authentication
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("screening_batches")
      .select("*")
      .order("screening_date", { ascending: false });

    if (symbol) {
      const symbols = symbol.split(",").map((s) => s.trim()).filter(Boolean);
      if (symbols.length === 1) {
        query = query.ilike("symbol", `%${symbols[0]}%`);
      } else if (symbols.length > 1) {
        query = query.in("symbol", symbols);
      }
    }

    if (date) {
      query = query.eq("screening_date", date);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
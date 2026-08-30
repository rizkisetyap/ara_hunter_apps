import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { emitenSchema } from "@/lib/schemas/emiten";

export async function GET() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("emitens").select("*").order("symbol");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = emitenSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.format() }, { status: 400 });

    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("emitens").insert(result.data).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

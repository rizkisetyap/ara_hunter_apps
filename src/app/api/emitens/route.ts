import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { emitenSchema } from "@/lib/schemas/emiten";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: Request) {
  // Check authentication - accept either auth_token cookie or Bearer token
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("emitens").select("*").order("symbol");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  // Check authentication
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = emitenSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.format() }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("emitens").insert(result.data).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
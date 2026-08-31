import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { updateEmitenSchema } from "@/lib/schemas/emiten";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("emitens")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Emiten not found" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body = await request.json();
    const result = updateEmitenSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("emitens")
      .update(result.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("emitens")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
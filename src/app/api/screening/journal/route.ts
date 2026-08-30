import { NextResponse } from "next/server";
import { journalAuditPayloadSchema } from "@/lib/schemas/ara-hunter";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.ARA_HUNTER_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing x-api-key" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = journalAuditPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid payload format", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = await createAdminClient();

    const { error } = await supabase.from("journal_audits").insert(
      data.map((item) => ({
        symbol: item.symbol,
        analysis_date: item.analysis_date,
        tt_id: item.tt_id,
        anchor_date: item.anchor_date,
        projected_date: item.projected_date,
        forecast: item.forecast,
        action: item.action,
        confidence: item.confidence,
        confidence_breakdown: item.confidence_breakdown,
        hard_vetoes: item.hard_vetoes,
        feature_snapshot: item.feature_snapshot,
        parameter_version: item.parameter_version,
        event_fingerprint: item.event_fingerprint,
        decision_fingerprint: item.decision_fingerprint,
      }))
    );

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: true, warning: "Processed with DB error or table pending", dbError: error.message, count: data.length });
    }

    return NextResponse.json({ success: true, inserted: data.length });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
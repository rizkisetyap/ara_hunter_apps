import { NextResponse } from "next/server";
import { screeningBatchPayloadSchema } from "@/lib/schemas/ara-hunter";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.ARA_HUNTER_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing x-api-key" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = screeningBatchPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid payload format", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = await createAdminClient();

    const { error } = await supabase.from("screening_batches").insert(
      data.map((item) => ({
        rank: item.Rank,
        symbol: item.Symbol,
        screening_date: item.Date,
        close: item.Close,
        low_3m: item.Low_3M,
        position: item.Position,
        price_position: item.PricePosition,
        forecast: item.Forecast,
        confidence: item.Confidence,
        risk: item.Risk,
        liquidity_score: item.LiquidityScore,
        tt1: item.TT1,
        tt2: item.TT2,
        tt3: item.TT3 || null,
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

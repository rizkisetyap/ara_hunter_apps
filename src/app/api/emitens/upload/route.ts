import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyAuthToken } from "@/lib/auth";
import ExcelJS from "exceljs";

export async function POST(request: Request) {
  // Verify auth via cookie / header token
  const isAuthed = await verifyAuthToken(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();

    // Parse Excel using exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as ArrayBuffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: "Invalid worksheet" }, { status: 400 });
    }

    const rows: { symbol: string; name: string }[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      // row.values is a 1-indexed array
      const values = row.values as unknown[];
      const ticker = values[2] as { value?: string } | string | undefined;
      const name = values[3] as { value?: string } | string | undefined;
      const tickerStr = typeof ticker === "string" ? ticker : ticker?.value;
      const nameStr = typeof name === "string" ? name : name?.value;
      if (tickerStr && String(tickerStr).trim()) {
        rows.push({
          symbol: String(tickerStr).trim().toUpperCase(),
          name: String(nameStr || "").trim(),
        });
      }
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid data found in file" }, { status: 400 });
    }

    // Use Supabase upsert (onConflict) so existing symbols are skipped / updated
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("emitens")
      .upsert(rows, { onConflict: "symbol", ignoreDuplicates: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const inserted = data ? (data as unknown[]).length : 0;
    return NextResponse.json({
      message: "Upload complete",
      totalRows: rows.length,
      inserted,
      skipped: rows.length - inserted,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

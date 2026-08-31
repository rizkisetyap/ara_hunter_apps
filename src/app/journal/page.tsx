import { createAdminClient } from "@/lib/supabase/server";

// Revalidate every 60 seconds (SSG with ISR / incremental static regeneration)
export const revalidate = 60;

interface JournalAudit {
  id: string;
  symbol: string;
  analysis_date: string;
  tt_id: string;
  anchor_date: string;
  projected_date: string;
  forecast: string;
  action: string;
  confidence: number;
  confidence_breakdown: {
    time: number;
    price: number;
    momentum: number;
    trend: number;
    compression: number;
    volume: number;
    penalty: number;
  };
  hard_vetoes: string[];
  feature_snapshot: {
    close: number;
    low_3m: number;
    high_3m: number;
    position: number;
    volume_ratio: number;
    upper_wick_ratio: number;
  };
  parameter_version: string;
  event_fingerprint: string;
  decision_fingerprint: string;
}

export default async function JournalPage() {
  let journalData: JournalAudit[] = [];
  let error: { message: string } | null = null;

  try {
    const supabase = createAdminClient();
    const { data, error: dbError } = await supabase
      .from("journal_audits")
      .select("*")
      .order("analysis_date", { ascending: false })
      .limit(50);

    if (dbError) {
      error = { message: dbError.message };
    } else {
      journalData = (data || []) as JournalAudit[];
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error = { message: err.message };
    } else {
      error = { message: "An unknown error occurred" };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journal Audits</h1>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 p-4 rounded text-amber-700 dark:text-amber-300">
          <p className="font-bold">Notice</p>
          <p>Database query result: {error.message}. Ensure tables exist and data has been posted via POST /api/screening/journal.</p>
        </div>
      )}

      <div className="space-y-4">
        {journalData && journalData.length > 0 ? (
          journalData.map((audit: JournalAudit) => (
            <div key={audit.id} className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{audit.symbol}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {audit.tt_id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                      {audit.forecast}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Analysis: {audit.analysis_date} | Anchor: {audit.anchor_date} | Projected: {audit.projected_date}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Action: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{audit.action}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Confidence: {audit.confidence}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block mb-2">Confidence Breakdown</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
                    <div>Time: {audit.confidence_breakdown?.time}</div>
                    <div>Price: {audit.confidence_breakdown?.price}</div>
                    <div>Momentum: {audit.confidence_breakdown?.momentum}</div>
                    <div>Trend: {audit.confidence_breakdown?.trend}</div>
                    <div>Compression: {audit.confidence_breakdown?.compression}</div>
                    <div>Volume: {audit.confidence_breakdown?.volume}</div>
                    <div>Penalty: {audit.confidence_breakdown?.penalty}</div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block mb-2">Feature Snapshot</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
                    <div>Close: {audit.feature_snapshot?.close}</div>
                    <div>Low 3M: {audit.feature_snapshot?.low_3m}</div>
                    <div>High 3M: {audit.feature_snapshot?.high_3m}</div>
                    <div>Position: {audit.feature_snapshot?.position}</div>
                    <div>Volume Ratio: {audit.feature_snapshot?.volume_ratio}</div>
                    <div>Upper Wick Ratio: {audit.feature_snapshot?.upper_wick_ratio}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-600 pt-3">
                <span>Param Version: {audit.parameter_version}</span>
                <div className="flex gap-4 font-mono">
                  <span>Event: {audit.event_fingerprint?.slice(0, 10)}...</span>
                  <span>Decision: {audit.decision_fingerprint?.slice(0, 10)}...</span>
                </div>
              </div>
            </div>
          ))
        ) : journalData && journalData.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
            No journal audit records found. Post data to <code>/api/screening/journal</code>.
          </div>
        ) : null}
      </div>
    </div>
  );
}
import { createAdminClient } from "@/lib/supabase/server";

export default async function JournalPage() {
  const supabase = await createAdminClient();

  const { data: journalData, error } = await supabase
    .from("journal_audits")
    .select("*")
    .order("analysis_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Journal Audits</h1>
      </div>

      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-amber-700">
          <p className="font-bold">Notice</p>
          <p>Database query result: {error.message}. Ensure tables exist and data has been posted via POST /api/screening/journal.</p>
        </div>
      )}

      <div className="space-y-4">
        {journalData && journalData.length > 0 ? (
          journalData.map((audit: any) => (
            <div key={audit.id} className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600 font-mono">{audit.symbol}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {audit.tt_id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {audit.forecast}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Analysis: {audit.analysis_date} | Anchor: {audit.anchor_date} | Projected: {audit.projected_date}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">Action: <span className="text-emerald-600 font-bold">{audit.action}</span></div>
                  <div className="text-xs text-gray-500">Confidence: {audit.confidence}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-700 block mb-2">Confidence Breakdown</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                    <div>Time: {audit.confidence_breakdown?.time}</div>
                    <div>Price: {audit.confidence_breakdown?.price}</div>
                    <div>Momentum: {audit.confidence_breakdown?.momentum}</div>
                    <div>Trend: {audit.confidence_breakdown?.trend}</div>
                    <div>Compression: {audit.confidence_breakdown?.compression}</div>
                    <div>Volume: {audit.confidence_breakdown?.volume}</div>
                    <div>Penalty: {audit.confidence_breakdown?.penalty}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-700 block mb-2">Feature Snapshot</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                    <div>Close: {audit.feature_snapshot?.close}</div>
                    <div>Low 3M: {audit.feature_snapshot?.low_3m}</div>
                    <div>High 3M: {audit.feature_snapshot?.high_3m}</div>
                    <div>Position: {audit.feature_snapshot?.position}</div>
                    <div>Volume Ratio: {audit.feature_snapshot?.volume_ratio}</div>
                    <div>Upper Wick Ratio: {audit.feature_snapshot?.upper_wick_ratio}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                <span>Param Version: {audit.parameter_version}</span>
                <div className="flex gap-4 font-mono">
                  <span>Event: {audit.event_fingerprint?.slice(0, 10)}...</span>
                  <span>Decision: {audit.decision_fingerprint?.slice(0, 10)}...</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
            No journal audit records found. Post data to <code>/api/screening/journal</code>.
          </div>
        )}
      </div>
    </div>
  );
}

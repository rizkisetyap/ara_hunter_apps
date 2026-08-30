import { createAdminClient } from "@/lib/supabase/server";

export default async function ScreeningPage() {
  const supabase = await createAdminClient();

  const { data: screeningData, error } = await supabase
    .from("screening_batches")
    .select("*")
    .order("screening_date", { ascending: false })
    .limit(50);
  console.log(error)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Screening Batches</h1>
      </div>

      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-amber-700">
          <p className="font-bold">Notice</p>
          <p>Database query result: {error.message}. Ensure tables exist and data has been posted via POST /api/screening/batch.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Close</th>
                <th className="py-3 px-4">Low (3M)</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Forecast</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">TT1</th>
                <th className="py-3 px-4">TT2</th>
                <th className="py-3 px-4">TT3</th>
              </tr>
            </thead>
            <tbody>
              {screeningData && screeningData.length > 0 ? (
                screeningData.map((row: any) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">{row.rank}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{row.symbol}</td>
                    <td className="py-3 px-4">{row.screening_date}</td>
                    <td className="py-3 px-4">{row.close}</td>
                    <td className="py-3 px-4">{row.low_3m}</td>
                    <td className="py-3 px-4">{row.position}</td>
                    <td className="py-3 px-4">{row.forecast}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded">
                        {row.confidence}%
                      </span>
                    </td>
                    <td className="py-3 px-4">{row.risk}</td>
                    <td className="py-3 px-4">{row.tt1}</td>
                    <td className="py-3 px-4">{row.tt2}</td>
                    <td className="py-3 px-4">{row.tt3 || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500">
                    No screening batches available. Post data to <code>/api/screening/batch</code>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

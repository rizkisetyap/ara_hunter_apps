"use client";

import { useState, useEffect } from "react";

export default function ScreeningPage() {
  const [symbolFilter, setSymbolFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [screeningData, setScreeningData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (symbolFilter) params.append("symbol", symbolFilter);
        if (dateFilter) params.append("date", dateFilter);

        const response = await fetch(`/api/screening/query?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScreeningData(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbolFilter, dateFilter]);

  const clearFilters = () => {
    setSymbolFilter("");
    setDateFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Screening Batches</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symbol Filter
            </label>
            <input
              type="text"
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              placeholder="e.g., AAPL, GOOGL"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Filter
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Counter */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {screeningData.length} records
        {loading ? "" : screeningData.length === 0 ? " (no data)" : ""}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 p-4 rounded text-amber-700 dark:text-amber-300">
          <p className="font-bold">Error</p>
          <p>{error}. Ensure data has been posted via POST /api/screening/batch.</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">Loading data...</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b dark:border-gray-700">
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
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {screeningData.length > 0 ? (
                  screeningData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">{row.rank}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{row.symbol}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.screening_date}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.close}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.low_3m}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.position}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.forecast}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded">
                          {row.confidence}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.risk}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.tt1}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.tt2}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{row.tt3 || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No screening batches available matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
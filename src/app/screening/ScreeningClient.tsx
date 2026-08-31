"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Download, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ScreeningClientProps {
  initialData: Array<Record<string, unknown>>;
  symbolOptions: { symbol: string; name: string }[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialFilters: {
    symbols: string[];
    date: string;
  };
}

interface ScreeningRow {
  id: string;
  rank: number;
  symbol: string;
  screening_date: string;
  close: number;
  low_3m: number;
  position: string;
  forecast: string;
  confidence: number;
  risk: string;
  tt1: string;
  tt2: string;
  tt3?: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ScreeningClient({
  initialData,
  symbolOptions,
  initialPagination,
  initialFilters,
}: ScreeningClientProps) {
  const router = useRouter();
  const [screeningData, setScreeningData] = useState<ScreeningRow[]>(
    initialData as unknown as ScreeningRow[]
  );
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(initialFilters.symbols || []);
  const [dateFilter, setDateFilter] = useState<string>(initialFilters.date || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Please login to access this page");
      router.push("/login");
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  const fetchPage = useCallback(
    async (page: number) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (selectedSymbols.length > 0) {
          params.append("symbol", selectedSymbols.join(","));
        }
        if (dateFilter) params.append("date", dateFilter);
        params.append("page", page.toString());
        params.append("limit", "10"); // 10 items per page

        const response = await fetch(`/api/screening/query?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        setScreeningData(json.data || []);
        setPagination(
          json.pagination || { page, limit: 10, total: 0, totalPages: 0 }
        );
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedSymbols, dateFilter]
  );

  const handleApplyFilter = () => {
    fetchPage(1);
  };

  const clearFilters = () => {
    setSelectedSymbols([]);
    setDateFilter("");
    setSearchSymbol("");
    setDropdownOpen(false);
    fetchPage(1);
  };

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSymbols.length > 0) {
        params.append("symbol", selectedSymbols.join(","));
      }
      if (dateFilter) params.append("date", dateFilter);
      let allRows: unknown[] = [];
      // Fetch ALL pages for export
      let page = 1;
      while (true) {
        params.set("page", page.toString());
        params.set("limit", "10000"); // Large limit to get all in one go for export
        const response = await fetch(`/api/screening/export?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data for CSV export");
        }
        const data = await response.json();
        allRows = allRows.concat(data.data || []);
        if (data.data?.length < 10000 || allRows.length >= (data.total || 0)) {
          break;
        }
        page++;
      }
      if (allRows.length === 0) {
        toast.warning("No data available to export");
        return;
      }
      const rows = allRows as ScreeningRow[];
      // Build CSV content
      const headers = ["rank", "symbol", "screening_date", "close", "low_3m", "position", "forecast", "confidence", "risk", "tt1", "tt2", "tt3"];
      const csvRows = [headers.join(",")];
      rows.forEach((row: ScreeningRow) => {
        const values = headers.map((h) => {
          const val = row[h as keyof ScreeningRow];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return `"${str.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(","));
      });
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `screening_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
          document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${rows.length} records as CSV`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const toggleSymbol = (symbol: string) => {
    const newSelected = selectedSymbols.includes(symbol)
      ? selectedSymbols.filter((s) => s !== symbol)
      : [...selectedSymbols, symbol];
    setSelectedSymbols(newSelected);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Symbol Multi-Select Dropdown */}
          <div className="relative flex-1 min-w-[200px]" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symbols Filter
            </label>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="min-h-[42px] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-between cursor-pointer hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-colors"
            >
              <div className="flex flex-wrap gap-1.5 items-center max-h-20 overflow-y-auto pr-2">
                {selectedSymbols.length === 0 ? (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Select symbols...</span>
                ) : (
                  selectedSymbols.slice(0, 3).map((symbol) => (
                    <span
                      key={symbol}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      {symbol}
                    </span>
                  ))
                )}
                {selectedSymbols.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{selectedSymbols.length - 3} more</span>
                )}
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {dropdownOpen && symbolOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    placeholder="Search symbol or name..."
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  {symbolOptions
                    .filter(
                      (item) =>
                        item.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
                        item.name.toLowerCase().includes(searchSymbol.toLowerCase())
                    )
                    .map((item) => {
                      const isSelected = selectedSymbols.includes(item.symbol);
                      return (
                        <div
                          key={item.symbol}
                          onClick={() => toggleSymbol(item.symbol)}
                          className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex-1 truncate">
                            <span className="font-mono font-bold mr-2">{item.symbol}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-[11px] truncate">{item.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Filter
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-1.5 h-[42px]"
            >
              Apply
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-1.5 h-[42px]"
            >
              <Download size={16} />
              Download CSV
            </button>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-[42px]"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b dark:border-gray-700">
              <tr>
                <th className="py-3 px-4 w-[60px]">Rank</th>
                <th className="py-3 px-4 w-[120px]">Symbol</th>
                <th className="py-3 px-4 w-[120px]">Date</th>
                <th className="py-3 px-4 w-[100px]">Close</th>
                <th className="py-3 px-4 w-[100px]">Low (3M)</th>
                <th className="py-3 px-4 w-[150px]">Position</th>
                <th className="py-3 px-4 w-[180px]">Forecast</th>
                <th className="py-3 px-4 w-[110px]">Confidence</th>
                <th className="py-3 px-4 w-[100px]">Risk</th>
                <th className="py-3 px-4 w-[120px]">TT1</th>
                <th className="py-3 px-4 w-[120px]">TT2</th>
                <th className="py-3 px-4 w-[120px]">TT3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading data...
                  </td>
                </tr>
              ) : screeningData.length > 0 ? (
                screeningData.map((row: ScreeningRow) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">{row.rank}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.symbol}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.screening_date}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.close}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.low_3m ?? "-"}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.position ?? "-"}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.forecast ?? "-"}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded">
                        {row.confidence ?? "-"}{row.confidence != null ? "%" : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.risk ?? "-"}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.tt1 ?? "-"}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.tt2 ?? "-"}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.tt3 || "-"}</td>
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} total)
          </span>
          <div className="flex items-center gap-4">
            {pagination.total > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            )}
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchPage(pagination.page - 1)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages || loading || pagination.totalPages === 0}
                onClick={() => fetchPage(pagination.page + 1)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

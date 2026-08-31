"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, ChevronDown, Check, X, Filter } from "lucide-react";

interface ScreeningClientProps {
  initialData: Array<Record<string, unknown>>;
  symbolOptions: { symbol: string; name: string }[];
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

export default function ScreeningClient({ initialData, symbolOptions }: ScreeningClientProps) {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [screeningData, setScreeningData] = useState<ScreeningRow[]>(initialData as unknown as ScreeningRow[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth check: redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Please login to access this page");
      router.push("/login");
    }
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSymbol = (symbol: string) => {
    const newSelected = selectedSymbols.includes(symbol)
      ? selectedSymbols.filter((s) => s !== symbol)
      : [...selectedSymbols, symbol];
    setSelectedSymbols(newSelected);
  };

  const removeSymbol = (symbolToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSymbols(selectedSymbols.filter((s) => s !== symbolToRemove));
  };

  const filteredOptions = symbolOptions.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
      item.name.toLowerCase().includes(searchSymbol.toLowerCase())
  );

  const handleFilter = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedSymbols.length > 0) {
        params.append("symbol", selectedSymbols.join(","));
      }
      if (dateFilter) params.append("date", dateFilter);

      const response = await fetch(`/api/screening/query?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setScreeningData(data.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSymbols.length > 0) {
        params.append("symbol", selectedSymbols.join(","));
      }
      if (dateFilter) params.append("date", dateFilter);

      const response = await fetch(`/api/screening/export?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data for CSV export");
      }

      const data = await response.json();
      const rows = data.data as ScreeningRow[];

      if (rows.length === 0) {
        toast.warning("No data available to export");
        return;
      }

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

  const clearFilters = () => {
    setSelectedSymbols([]);
    setDateFilter("");
    setSearchSymbol("");
    setScreeningData(initialData as unknown as ScreeningRow[]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Screening Batches</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Custom Multiple Select Dropdown for Symbols */}
          <div className="flex-1 min-w-[260px] relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symbols Filter
            </label>

            {/* Dropdown Trigger Box */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="min-h-[42px] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-between cursor-pointer hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-colors"
            >
              <div className="flex flex-wrap gap-1.5 items-center max-h-20 overflow-y-auto pr-2">
                {selectedSymbols.length === 0 ? (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Select symbols...
                  </span>
                ) : (
                  selectedSymbols.map((symbol) => (
                    <span
                      key={symbol}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      {symbol}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-blue-900 dark:hover:text-blue-100"
                        onClick={(e) => removeSymbol(symbol, e)}
                      />
                    </span>
                  ))
                )}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-hidden flex flex-col">
                {/* Search inside dropdown */}
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

                {/* Options List */}
                <div className="overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((item) => {
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
                          <div>
                            <span className="font-mono font-bold mr-2">{item.symbol}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-[11px] truncate">
                              {item.name}
                            </span>
                          </div>
                          {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-center text-gray-400 dark:text-gray-500">
                      No symbols found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex-1 min-w-[160px]">
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
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-1.5 h-[42px]"
            >
              <Filter size={16} />
              Apply
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-1.5 h-[42px]"
            >
              <Download size={16} />
              CSV
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
                  screeningData.map((row: ScreeningRow) => (
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

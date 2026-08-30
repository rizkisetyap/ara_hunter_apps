"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              ARA Hunter <span className="text-blue-600">Pipeline</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 mb-10">
              Sistem backend terpadu untuk pengolahan data screening saham dan audit algoritma secara real-time.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/screening"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Lihat Data Screening <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Automated Ingestion</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Menerima data dari pipeline Python secara otomatis melalui API endpoint yang tervalidasi Zod.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Algorithm Audit</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Melacak jejak audit deterministik algoritma untuk memastikan akurasi forecast dan sinyal TT.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Autentikasi berlapis menggunakan API Key untuk pipeline dan Session Auth untuk antarmuka pengguna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Info */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Informasi Proyek</h2>
          <div className="text-left bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">API Endpoint Utama:</h4>
              <ul className="mt-2 space-y-2 font-mono text-sm">
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">POST</span>
                  /api/screening/batch
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">POST</span>
                  /api/screening/journal
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded">GET</span>
                  /api/emitens/active
                </li>
              </ul>
            </div>
            <p className="text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-50 dark:border-gray-800">
              Proyek ini menggunakan Next.js App Router, Supabase SSR, dan Tailwind CSS untuk memberikan performa maksimal dalam memvisualisasikan data analisis pasar modal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

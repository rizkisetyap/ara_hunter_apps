"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home as HomeIcon, Table, FileText, CheckSquare } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Screening Batches", href: "/screening", icon: Table },
  { label: "Journal Audits", href: "/journal", icon: FileText },
  { label: "Todos", href: "/todos", icon: CheckSquare },
];

export default function Home() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          ARA Hunter Pipeline
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-6">
          Next.js App Router backend operational. Endpoints active:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-gray-300 text-base">
          <li>
            <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
              POST /api/screening/batch
            </code>
            - Screening batch ingestion with Zod validation
          </li>
          <li>
            <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
              POST /api/screening/journal
            </code>{" "}
            - Journal audit audit-trail ingestion
          </li>
        </ul>

        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2">
            Environment Variables
          </h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              ARA_HUNTER_API_KEY = b70b572c2e07e3d3243b0c0e36bf17ba48b3ff57f900fdf72a82ae23db5a7f34
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              SUPABASE_SERVICE_ROLE_KEY = dea87e0495b8826c6af07d1b50daa66da7e4354521a62f969f495d6d8b6cca5c
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            These keys are used for API authentication and database operations.
          </p>
        </div>
      </div>
    </div>
  );
}
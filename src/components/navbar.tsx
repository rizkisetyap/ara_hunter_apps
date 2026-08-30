"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, Table, FileText } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Screening Batches", href: "/screening", icon: Table },
  { label: "Journal Audits", href: "/journal", icon: FileText },
  { label: "Todos", href: "/todos", icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-gray-800">
              ARA Hunter
            </span>
          </div>

          <div className="flex space-x-4">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

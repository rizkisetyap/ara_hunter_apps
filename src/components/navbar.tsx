"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Home, Table, FileText, CheckSquare, Building2, LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const publicItems = [
  { label: "Home", href: "/", icon: Home },
];

const protectedItems = [
  { label: "Emiten", href: "/dashboard/emitens", icon: Building2 },
  { label: "Screening Batches", href: "/screening", icon: Table },
  { label: "Journal Audits", href: "/journal", icon: FileText },
  { label: "Todos", href: "/todos", icon: CheckSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (client-side)
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
    // Re-check auth on focus or storage change
    window.addEventListener("focus", checkAuth);
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("focus", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", {
        method: "DELETE",
      });
      localStorage.removeItem("auth_token");
      setIsAuthenticated(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = isAuthenticated ? [...publicItems, ...protectedItems] : publicItems;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ARA Hunter
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
            
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

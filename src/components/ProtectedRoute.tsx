"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredAuth?: boolean;
}

export default function ProtectedRoute({ children, requiredAuth = true }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (requiredAuth) {
      const token = localStorage.getItem("auth_token");
      console.log(token)
      if (!token) {
        toast.error("Please login to access this page");
        router.push("/login");
      }
    }
  }, [router, requiredAuth]);

  // Client-side check - redirect if no token
  if (requiredAuth && typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
    return null;
  }

  return <>{children}</>;
}

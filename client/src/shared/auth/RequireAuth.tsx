import { Navigate, Outlet } from "react-router";
import { useAccess } from "./useAccess";
import type { ReactNode } from "react";

interface RequireAuthProps {
  fallback?: ReactNode;
}

export function RequireAuth({ fallback = null }: RequireAuthProps) {
  const { isAuthenticated, isPending } = useAccess();

  if (isPending) {
    return fallback;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

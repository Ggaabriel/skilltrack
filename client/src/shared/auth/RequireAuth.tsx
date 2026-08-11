import { Navigate, Outlet } from "react-router";
import { useAccess } from "./useAccess";

export function RequireAuth() {
  const { isAuthenticated, isPending } = useAccess();

  if (isPending) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
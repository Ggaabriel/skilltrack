import type { ReactNode } from "react";
import type { Access } from "./access";
import { useAccess } from "./useAccess";

interface CanProps {
  access?: Access;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({
  access,
  children,
  fallback = null,
}: CanProps) {
  const { isAuthenticated, isPending } = useAccess();

  if (isPending) {
    return fallback;
  }

  if (!access) {
    return children;
  }

  const allowed =
    access === "authenticated"
      ? isAuthenticated
      : !isAuthenticated;

  return allowed ? children : fallback;
}
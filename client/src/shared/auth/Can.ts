import type { ReactNode } from "react";
import type { Access } from "./access";
import { canAccess } from "./canAccess";
import { useAccess } from "./useAccess";

interface CanProps {
  access: Access;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ access, children, fallback = null }: CanProps) {
  const { isAuthenticated, isPending } = useAccess();

  if (isPending) {
    return null;
  }

  if (!canAccess(access, isAuthenticated)) {
    return fallback;
  }

  return children;
}

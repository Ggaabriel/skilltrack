import { useAuthStore } from "./store";

export const useAuthMode = () => useAuthStore((state) => state.mode);
export const useAuthIsOpen = () => useAuthStore((state) => state.isOpen);
export const useOpenAuth = () => useAuthStore((state) => state.openAuth);
export const useCloseAuth = () => useAuthStore((state) => state.closeAuth);

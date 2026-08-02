import { create } from "zustand";

type AuthMode = "login" | "register";

interface AuthStore {
  isOpen: boolean;
  mode: AuthMode;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  mode: "login",

  openAuth: (mode) =>
    set({
      isOpen: true,
      mode,
    }),

  closeAuth: () =>
    set({
      isOpen: false,
      mode: "login",
    }),
}));

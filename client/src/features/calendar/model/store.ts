import { create } from "zustand";

interface AuthStore {
  selectedDate: Date;
}

export const useCalendarStore = create<AuthStore>((set) => ({
  selectedDate: new Date(),
  setS
}));

import { Calendar } from "@/features/calendar";
import { CalendarSkeleton } from "@/features/calendar/ui/skeletons/calendar-skeleton";
import { Suspense } from "react";

export const CalendarPage = () => {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <Calendar />
    </Suspense>
  );
};

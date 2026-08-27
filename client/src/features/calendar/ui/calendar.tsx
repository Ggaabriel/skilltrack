import { CalendarBody } from "@/features/calendar/ui/calendar-body";
import { CalendarProvider } from "@/features/calendar/model/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/model/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/ui/header/calendar-header";

export function Calendar() {
  return (
    <CalendarProvider view="month">
      <DndProvider>
        <div className="w-full rounded-xl">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}

import { CalendarBody } from "@/features/calendar/ui/calendar-body";
import { CalendarProvider } from "@/features/calendar/model/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/model/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/ui/header/calendar-header";
import { useEventsQuery } from "./api/event.queries";

export function Calendar() {
  // const events: IEvent[] = [{
  //   id: 1,
  //   title: "Event 1",
  //   startDate: "2026-06-04T10:00:00",
  //   endDate: "2026-06-04T11:00:00",
  //   color: "blue",
  //   description: "Event 1 description"
  // }]

  const eventsQuery = useEventsQuery("2021-01-01", "2027-01-01");
  console.log(eventsQuery.data);

  return (
    <CalendarProvider events={eventsQuery.data?.data ?? []} view="month">
      <DndProvider>
        <div className="w-full rounded-xl">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}

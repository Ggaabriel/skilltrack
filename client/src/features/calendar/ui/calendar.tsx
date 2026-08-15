import { CalendarBody } from "@/features/calendar/ui/calendar-body";
import { CalendarProvider } from "@/features/calendar/model/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/model/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/ui/header/calendar-header";

export function Calendar() {
  // const events: IEvent[] = [{
  //   id: 1,
  //   title: "Event 1",
  //   startDate: "2026-06-04T10:00:00",
  //   endDate: "2026-06-04T11:00:00",
  //   color: "blue",
  //   description: "Event 1 description"
  // }]
  // const { selectedDate } = useCalendar();
  // console.log(selectedDate);
  
  // const user = useRequiredUser();

  // const year = selectedDate.getFullYear();

  // const start = `${year}-01-01`;
  // const end = `${year}-12-31`;

  // const eventsQuery = useEventsQuery(user.id, start, end);
  // console.log(eventsQuery.data);
  // const events = eventsQuery.data?.data ?? [];
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

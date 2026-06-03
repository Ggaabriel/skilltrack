import { CalendarBody } from "@/features/calendar/ui/calendar-body"
import { CalendarProvider } from "@/features/calendar/model/contexts/calendar-context"
import { DndProvider } from "@/features/calendar/model/contexts/dnd-context"
import { CalendarHeader } from "@/features/calendar/ui/header/calendar-header"
import { getEvents, getUsers } from "@/features/calendar/api/requests"

async function getCalendarData() {
  return {
    events: await getEvents(),
    users: await getUsers(),
  }
}

export async function Calendar() {
  const { events, users } = await getCalendarData()

  return (
    <CalendarProvider events={events} users={users} view="month">
      <DndProvider>
        <div className="w-full rounded-xl">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  )
}

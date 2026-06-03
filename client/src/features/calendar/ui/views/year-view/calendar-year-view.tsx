import { getYear, isSameDay, isSameMonth } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  staggerContainer,
  transition,
} from "@/features/calendar/config/animations"
import { useCalendar } from "@/features/calendar/model/hooks"
import { EventListDialog } from "@/features/calendar/ui/dialogs/events-list-dialog"
import { getCalendarCells } from "@/features/calendar/model/helpers"
import type { IEvent } from "@/features/calendar/model/interfaces"
import { EventBullet } from "@/features/calendar/ui/views/month-view/event-bullet"

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function CalendarYearView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar()
  const currentYear = getYear(selectedDate)
  const allEvents = [...multiDayEvents, ...singleDayEvents]

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-6">
      {/* Year grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {MONTHS.map((month, monthIndex) => {
          const monthDate = new Date(currentYear, monthIndex, 1)
          const cells = getCalendarCells(monthDate)

          return (
            <motion.div
              key={month}
              className="flex flex-col overflow-hidden rounded-lg border border-border shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: monthIndex * 0.05, ...transition }}
              aria-label={`${month} ${currentYear} calendar`}
            >
              {/* Month header */}
              <button
                type="button"
                className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-2 text-center text-sm font-semibold transition-colors hover:bg-primary/20 sm:text-base"
                onClick={() =>
                  setSelectedDate(new Date(currentYear, monthIndex, 1))
                }
                aria-label={`Select ${month}`}
              >
                {month}
              </button>

              <div className="grid grid-cols-7 py-2 text-center text-xs font-medium text-muted-foreground">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="p-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid flex-grow grid-cols-7 gap-0.5 p-1.5 text-xs">
                {cells.map((cell) => {
                  const isCurrentMonth = isSameMonth(cell.date, monthDate)
                  const isToday = isSameDay(cell.date, new Date())
                  const dayEvents = allEvents.filter((event) =>
                    isSameDay(new Date(event.startDate), cell.date)
                  )
                  const hasEvents = dayEvents.length > 0

                  return (
                    <div
                      key={cell.date.toISOString()}
                      className={cn(
                        "relative flex min-h-[2rem] flex-col items-center justify-start p-1",
                        !isCurrentMonth && "text-muted-foreground/40",
                        hasEvents && isCurrentMonth
                          ? "cursor-pointer hover:rounded-md hover:bg-accent/20"
                          : "cursor-default"
                      )}
                    >
                      {isCurrentMonth && hasEvents ? (
                        <EventListDialog date={cell.date} events={dayEvents}>
                          <div className="flex h-full w-full flex-col items-center justify-start gap-0.5">
                            <span
                              className={cn(
                                "flex size-5 items-center justify-center font-medium",
                                isToday &&
                                  "rounded-full bg-primary text-primary-foreground"
                              )}
                            >
                              {cell.day}
                            </span>
                            <div className="flex items-center justify-center gap-0.5">
                              {dayEvents.length <= 2 ? (
                                dayEvents
                                  .slice(0, 2)
                                  .map((event) => (
                                    <EventBullet
                                      key={event.id}
                                      color={event.color}
                                      className="size-1.5"
                                    />
                                  ))
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <EventBullet
                                    color={dayEvents[0].color}
                                    className="size-1.5"
                                  />
                                  <span className="text-[0.6rem]">
                                    +{dayEvents.length - 1}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </EventListDialog>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-start">
                          <span
                            className={cn(
                              "flex size-5 items-center justify-center font-medium"
                            )}
                          >
                            {cell.day}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

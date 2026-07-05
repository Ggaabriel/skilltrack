"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  slideFromLeft,
  slideFromRight,
  transition,
} from "@/features/calendar/config/animations"
import { useCalendar } from "@/features/calendar/model/hooks"
import { AddEditEventDialog } from "@/features/calendar/ui/dialogs/add-edit-event-dialog"
import { DateNavigator } from "@/features/calendar/ui/header/date-navigator"
import FilterEvents from "@/features/calendar/ui/header/filter"
import { TodayButton } from "@/features/calendar/ui/header/today-button"
import { Settings } from "@/features/calendar/ui/settings/settings"
import Views from "./view-tabs"

export function CalendarHeader() {
  const { view, events } = useCalendar()

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <motion.div
        className="flex items-center gap-3"
        variants={slideFromLeft}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5"
        variants={slideFromRight}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <div className="options flex flex-wrap items-center gap-4 md:gap-2">
          <FilterEvents />
          <Views />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5">
          {/* In this version of the calendar app, events are not associated with specific users, only with 1 user. */}
          {/* <UserSelect /> */}

          <AddEditEventDialog>
            <Button>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </AddEditEventDialog>
        </div>
        <Settings />
      </motion.div>
    </div>
  )
}

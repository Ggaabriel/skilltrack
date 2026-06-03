import { createContext } from "react"
import type { DragDropContextType, ICalendarContext } from "../interfaces"

export const CalendarContext = createContext({} as ICalendarContext)

export const DragDropContext = createContext<DragDropContextType | undefined>(
  undefined
)

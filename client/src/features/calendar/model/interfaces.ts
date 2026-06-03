import type {
  TCalendarView,
  TEventColor,
} from "@/features/calendar/model/types"

export interface IUser {
  id: string
  name: string
  picturePath: string | null
}

export interface IEvent {
  id: number
  startDate: string
  endDate: string
  title: string
  color: TEventColor
  description: string
  user: IUser
}

export interface ICalendarCell {
  day: number
  currentMonth: boolean
  date: Date
}

export interface ICalendarContext {
  selectedDate: Date
  view: TCalendarView
  setView: (view: TCalendarView) => void
  agendaModeGroupBy: "date" | "color"
  setAgendaModeGroupBy: (groupBy: "date" | "color") => void
  use24HourFormat: boolean
  toggleTimeFormat: () => void
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: IUser["id"] | "all"
  setSelectedUserId: (userId: IUser["id"] | "all") => void
  badgeVariant: "dot" | "colored"
  setBadgeVariant: (variant: "dot" | "colored") => void
  selectedColors: TEventColor[]
  filterEventsBySelectedColors: (colors: TEventColor) => void
  filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void
  users: IUser[]
  events: IEvent[]
  addEvent: (event: IEvent) => void
  updateEvent: (event: IEvent) => void
  removeEvent: (eventId: number) => void
  clearFilter: () => void
}

export interface DragDropContextType {
  draggedEvent: IEvent | null
  isDragging: boolean
  startDrag: (event: IEvent) => void
  endDrag: () => void
  handleEventDrop: (date: Date, hour?: number, minute?: number) => void
}

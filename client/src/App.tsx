import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "@/components/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Suspense } from "react"
import { CalendarSkeleton } from "@/features/calendar/ui/skeletons/calendar-skeleton"
import { Calendar } from "@/features/calendar/Calendar"

export function App() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <Header />
          <Suspense fallback={<CalendarSkeleton />}>
            <Calendar />
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App

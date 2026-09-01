import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Header() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 my-auto data-[orientation=vertical]:h-4 "
        />
        <h1 className="text-base font-medium">GOVNO EBANOE</h1>
        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Notifications</h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/Ggaabriel"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              ХУЙНЯ КУДА НИКТО НЕ ЗАЙДЁТ
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

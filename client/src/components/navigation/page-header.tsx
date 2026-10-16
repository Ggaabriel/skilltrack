import { Bell } from "lucide-react";
import { useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getPageNavigation } from "@/shared/routing/navigation";

import { BackButton } from "./back-button";
import { Breadcrumbs } from "./breadcrumbs";

export function PageHeader() {
  const { pathname } = useLocation();
  const navigation = getPageNavigation(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        {navigation.fallbackTo && (
          <BackButton fallbackTo={navigation.fallbackTo} />
        )}
        <Breadcrumbs items={navigation.breadcrumbs} />
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
                <h2 className="font-medium leading-none">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

import * as React from "react";
import { IconCalendarEvent, IconCode } from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/NavMain";
import { NavUser } from "@/components/NavUser";
import { Link } from "react-router";
import { Routes } from "@/shared/routing/routes";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { useAuthIsOpen, useOpenAuth } from "@/features/auth";

const data = {
  user: {
    name: "Mr.Penis",
    email: "hueta@dolboeb.ru",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Calendar",
      url: Routes.CALENDAR,
      icon: IconCalendarEvent,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const openAuth = useOpenAuth();
  const isOpen = useAuthIsOpen();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <IconCode className="size-5!" />
                <span className="text-base font-semibold">Skilltrack</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isOpen ? (
          <NavUser user={data.user} />
        ) : (
          <Button onClick={() => openAuth("login")}>
            <LogIn />

            <span className="group-data-[collapsible=icon]:hidden">LogIn</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

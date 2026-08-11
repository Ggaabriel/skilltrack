import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import type { Access } from "@/shared/auth/access";
import { Can } from "@/shared/auth/Can";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    access: Access;
  }[];
}) {
  const location = useLocation();
  const isActive = (url: string) => {
    return location.pathname === url;
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Can key={item.title} access={item.access}>
            <Link to={item.url} key={item.title}>
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive(item.url)}
                  tooltip={item.title}
                  className="cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          </Can>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

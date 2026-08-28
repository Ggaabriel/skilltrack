import { Skeleton } from "@/components/ui/skeleton";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export function NavItemSkeleton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="pointer-events-none">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-20" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

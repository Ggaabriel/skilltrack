import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { AuthDialog } from "@/features/auth";
import { CalendarSkeleton } from "@/features/calendar/ui/skeletons/calendar-skeleton";
import { CalendarPage } from "@/pages/calendar/ui/calendar-page";
import { SettingsPage } from "@/pages/settings";
import { RequireAuth } from "@/shared/auth/RequireAuth";
import { Routes } from "@/shared/routing/routes";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

function RootLayout() {
  return (
    <>
      <AuthDialog />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header />
        <Outlet />
      </SidebarInset>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          path: Routes.BASE,
          element: <div>Base</div>,
        },
        {
          element: <RequireAuth fallback={<CalendarSkeleton />} />,
          children: [
            {
              path: Routes.CALENDAR,
              element: <CalendarPage />,
            },
          ],
        },
        {
          element: <RequireAuth />,
          children: [
            {
              path: Routes.SETTINGS,
              element: <SettingsPage />,
            },
          ],
        },
        {
          path: "/*",
          element: <div>404 Not Found</div>,
        },
      ],
    },
  ],
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

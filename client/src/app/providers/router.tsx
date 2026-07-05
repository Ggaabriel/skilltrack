import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { CalendarPage } from "@/pages/calendar";
import { Routes } from "@/shared/routing/routes";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

function RootLayout() {
  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: Routes.BASE,
        element: <div>Base</div>,
      },
      {
        path: Routes.CALENDAR,
        element: <CalendarPage />,
      },
      {
        path: "/*",
        element: <div>404 Not Found</div>,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

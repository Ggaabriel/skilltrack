import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { AuthDialog } from "@/features/auth";
import { CalendarSkeleton } from "@/features/calendar/ui/skeletons/calendar-skeleton";
import { CalendarPage } from "@/pages/calendar/ui/calendar-page";
import { CoursesPage } from "@/pages/courses";
import { CourseBuilderPage } from "@/pages/course-builder";
import { CourseReaderPage } from "@/pages/course-reader/ui/course-reader-page";
import { HomePage } from "@/pages/home/ui/home-page";
import { ProfilePage } from "@/pages/profile/ui/profile-page";
import { UserProfilePage } from "@/pages/user-profile/ui/user-profile-page";
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

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: Routes.BASE,
        element: <HomePage />,
      },
      {
        path: Routes.USER_PROFILE,
        element: <UserProfilePage />,
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
            path: Routes.COURSES,
            element: <CoursesPage />,
          },
          {
            path: Routes.COURSE_BUILDER,
            element: <CourseBuilderPage />,
          },
          {
            path: Routes.COURSE_READER,
            element: <CourseReaderPage />,
          },
          {
            path: Routes.SETTINGS,
            element: <SettingsPage />,
          },
          {
            path: Routes.PROFILE,
            element: <ProfilePage />,
          },
        ],
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

import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOpenAuth } from "@/features/auth";
import { CourseProgressOverview } from "@/features/course-progress/ui/course-progress-overview";
import { useAccess } from "@/shared/auth/useAccess";
import { Routes } from "@/shared/routing/routes";

export function HomePage() {
  const { user, isPending } = useAccess();
  const openAuth = useOpenAuth();

  if (isPending) {
    return (
      <main className="flex-1 space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-36" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <section className="max-w-lg space-y-4 text-center">
          <h1 className="text-3xl font-semibold">
            Keep learning with SkillTrack
          </h1>
          <p className="text-muted-foreground">
            Sign in to track your course progress and continue where you left
            off.
          </p>
          <Button onClick={() => openAuth("login")}>Sign in</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-muted-foreground">
              Pick up your learning where you left off.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to={Routes.COURSES}>Explore courses</Link>
          </Button>
        </header>
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Your learning progress</h2>
          <CourseProgressOverview />
        </section>
      </div>
    </main>
  );
}

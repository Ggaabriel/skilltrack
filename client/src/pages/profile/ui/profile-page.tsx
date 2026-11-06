import { CourseProgressOverview } from "@/features/course-progress/ui/course-progress-overview";
import { useAccess } from "@/shared/auth/useAccess";

export function ProfilePage() {
  const { user } = useAccess();

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          {user && (
            <p className="text-muted-foreground">
              {user.name} · {user.email}
            </p>
          )}
        </header>
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Learning progress</h2>
          <CourseProgressOverview />
        </section>
      </div>
    </main>
  );
}

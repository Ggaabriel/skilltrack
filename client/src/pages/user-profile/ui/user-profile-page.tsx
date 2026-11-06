import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicUserProfileQuery } from "@/entities/user/api/user.queries";
import { Routes } from "@/shared/routing/routes";

export function UserProfilePage() {
  const { userId = "" } = useParams();
  const profile = usePublicUserProfileQuery(userId);

  if (profile.isLoading) {
    return (
      <main className="flex-1 space-y-6 p-6">
        <Skeleton className="h-24 w-full max-w-xl" />
        <Skeleton className="h-48 w-full" />
      </main>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm text-destructive">
          {profile.error?.message ?? "Profile not found."}
        </p>
        {profile.isError && (
          <Button variant="outline" onClick={() => void profile.refetch()}>
            Try again
          </Button>
        )}
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center gap-4">
          {profile.data.picturePath ? (
            <img
              src={profile.data.picturePath}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
              {profile.data.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.data.name}
            </h1>
            <p className="text-sm text-muted-foreground">Course author</p>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Published courses</h2>
          {profile.data.publishedCourses.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profile.data.publishedCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {course.type.replaceAll("_", " ")}
                    </span>
                    <Button asChild size="sm">
                      <Link
                        to={Routes.COURSE_READER.replace(
                          ":courseId",
                          String(course.id),
                        )}
                      >
                        Read course
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              This author has no published courses yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

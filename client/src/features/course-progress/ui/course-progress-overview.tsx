import { Link } from "react-router";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCourseProgressSummariesQuery,
  useRemoveCourseFromProgressMutation,
  useResetCourseProgressMutation,
  type CourseProgressSummary,
} from "@/entities/node-progress";
import { Routes } from "@/shared/routing/routes";

export function CourseProgressOverview() {
  const progress = useCourseProgressSummariesQuery();

  if (progress.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }

  if (progress.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 p-4">
        <p className="text-sm text-destructive">{progress.error.message}</p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => void progress.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const courses = progress.data ?? [];

  if (!courses.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No published courses available to track yet.
        </p>
        <Button asChild variant="link" className="mt-2">
          <Link to={Routes.COURSES}>Explore courses</Link>
        </Button>
      </div>
    );
  }

  const activeCourses = courses.filter(
    (course) => course.percentage < 100 || course.totalNodes === 0,
  );
  const completedCourses = courses.filter(
    (course) => course.percentage === 100 && course.totalNodes > 0,
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-medium">In progress</h3>
        {activeCourses.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeCourses.map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            No courses in progress.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Completed courses</h3>
        {completedCourses.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completedCourses.map((course) => (
              <CourseProgressCard key={course.id} course={course} completed />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            Courses you complete will appear here.
          </p>
        )}
      </section>
    </div>
  );
}

function CourseProgressCard({
  course,
  completed = false,
}: {
  course: CourseProgressSummary;
  completed?: boolean;
}) {
  const reset = useResetCourseProgressMutation(Number(course.id));
  const remove = useRemoveCourseFromProgressMutation(Number(course.id));

  function resetProgress() {
    reset.mutate(undefined, {
      onSuccess: () => toast.success("Course progress reset."),
      onError: (error) => toast.error(error.message),
    });
  }

  function removeFromProgress() {
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Course removed from your progress."),
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <CardDescription>
          {course.type.replaceAll("_", " ")} ·{" "}
          <Link
            className="hover:text-foreground hover:underline"
            to={Routes.USER_PROFILE.replace(
              ":userId",
              String(course.author.id),
            )}
          >
            By {course.author.name}
          </Link>
          <br />
          {course.completedNodes} of {course.totalNodes} nodes completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${course.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={course.percentage}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${course.percentage}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            {completed ? "Completed" : `${course.percentage}%`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={remove.isPending}
              onClick={removeFromProgress}
              aria-label={`Remove ${course.title} from your progress`}
            >
              <Trash2 className={remove.isPending ? "animate-pulse" : ""} />
              Remove
            </Button>
            {completed && (
              <Button
                size="sm"
                variant="outline"
                disabled={reset.isPending}
                onClick={resetProgress}
              >
                <RotateCcw className={reset.isPending ? "animate-spin" : ""} />
                Restart
              </Button>
            )}
            <Button asChild size="sm">
              <Link
                to={Routes.COURSE_READER.replace(
                  ":courseId",
                  String(course.id),
                )}
              >
                {completed
                  ? "Review"
                  : course.percentage
                    ? "Continue"
                    : "Start"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

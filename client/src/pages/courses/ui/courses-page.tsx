import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCourseDialog } from "@/features/course/create-course";
import { useCoursesQuery } from "@/entities/course/api/course.queries";

import { Link } from "react-router";
import { Routes } from "@/shared/routing/routes";

export function CoursesPage() {
  const {
    data: courses,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoursesQuery();

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Courses
            </h1>

            <p className="text-muted-foreground">
              Manage your courses and discover new ones.
            </p>
          </div>

          <CreateCourseDialog />
        </div>

        <Tabs defaultValue="my-courses">
          <TabsList>
            <TabsTrigger value="my-courses">
              My courses
            </TabsTrigger>

            <TabsTrigger value="catalog">
              Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-courses" className="mt-6">
            {isLoading && <CoursesSkeleton />}

            {isError && (
              <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30">
                <p className="text-sm text-destructive">
                  {error.message}
                </p>

                <Button
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Try again
                </Button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              courses?.length === 0 && (
                <div className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                  <div className="text-center">
                    <h2 className="font-medium">
                      No courses yet
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first course and start learning.
                    </p>
                  </div>

                  <CreateCourseDialog />
                </div>
              )}

            {!isLoading &&
              !isError &&
              courses &&
              courses.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">
                          {course.title}
                        </CardTitle>

                        {course.description && (
                          <CardDescription className="line-clamp-3">
                            {course.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-md bg-muted px-2 py-1 text-xs"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {course.type}
                          </span>

                          <Button asChild size="sm">
                            <Link
                              to={`${Routes.COURSES}/${course.id}`}
                            >
                              Open
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </TabsContent>

          <TabsContent value="catalog" className="mt-6">
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Public courses will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function CoursesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
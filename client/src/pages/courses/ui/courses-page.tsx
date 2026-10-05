import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CreateCourseDialog } from "@/features/course/create-course";

export function CoursesPage() {
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
            <TabsTrigger value="my-courses">My courses</TabsTrigger>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="my-courses" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>My course</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your courses will appear here.
                  </p>
                </CardContent>
              </Card>
            </div>
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
import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { usePublishedCourseQuery } from "@/entities/course/api/course.queries";
import {
  useNodeProgressQuery,
  useSetNodeProgressMutation,
} from "@/entities/node-progress";
import { CourseContentReader } from "../components/course-content-reader";

export function CourseReaderPage() {
  const { courseId = "" } = useParams();
  const course = usePublishedCourseQuery(courseId);
  const numericCourseId = Number(courseId);
  const validCourseId =
    Number.isInteger(numericCourseId) && numericCourseId > 0;
  const progress = useNodeProgressQuery(validCourseId ? numericCourseId : null);
  const setProgress = useSetNodeProgressMutation(numericCourseId);
  const setProgressMutation = setProgress.mutate;
  const startAttemptedFor = useRef<string | null>(null);

  useEffect(() => {
    const firstNode = course.data?.nodes[0];
    if (
      !course.data ||
      !progress.isSuccess ||
      !progress.data ||
      progress.data.length > 0 ||
      !firstNode ||
      startAttemptedFor.current === course.data.id
    ) {
      return;
    }

    startAttemptedFor.current = course.data.id;
    setProgressMutation(
      { nodeId: Number(firstNode.id), percentage: 0 },
      {
        onError: (error) =>
          toast.error(`Could not start course progress: ${error.message}`),
      },
    );
  }, [course.data, progress.data, progress.isSuccess, setProgressMutation]);

  if (course.isLoading) {
    return <CourseContentReader course={null} isLoading />;
  }

  if (course.isError || !course.data) {
    return (
      <CourseContentReader
        course={null}
        error={course.error?.message ?? "Published course not found."}
        onRetry={() => void course.refetch()}
      />
    );
  }

  return (
    <CourseContentReader
      course={course.data}
      nodeProgress={progress.data}
      isProgressLoading={progress.isLoading}
      progressError={progress.isError ? progress.error.message : null}
      onRetryProgress={() => void progress.refetch()}
      isSavingProgress={setProgress.isPending}
      onSetNodeProgress={(nodeId, percentage) =>
        setProgress.mutate(
          { nodeId, percentage },
          {
            onError: (error) => toast.error(error.message),
          },
        )
      }
    />
  );
}

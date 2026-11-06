import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseNode } from "@/entities/node";
import type { PublishedCourse } from "@/entities/course/api/course.api";
import type { NodeProgress } from "@/entities/node-progress";
import { Routes } from "@/shared/routing/routes";

type CourseContentReaderProps = {
  course: PublishedCourse | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  nodeProgress?: NodeProgress[];
  isProgressLoading?: boolean;
  progressError?: string | null;
  onRetryProgress?: () => void;
  isSavingProgress?: boolean;
  onSetNodeProgress?: (nodeId: number, percentage: number) => void;
};

function MarkdownContent({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    contentType: "markdown",
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: [
          "max-w-none outline-none",
          "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold",
          "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_p]:my-3",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:my-1",
          "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono",
          "[&_a]:text-primary [&_a]:underline",
          "[&_hr]:my-5 [&_hr]:border-border",
        ].join(" "),
      },
    },
  });

  return (
    <div>
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

function ProgressToggle({
  nodeId,
  completed,
  disabled,
  onSetNodeProgress,
}: {
  nodeId: string;
  completed: boolean;
  disabled: boolean;
  onSetNodeProgress?: (nodeId: number, percentage: number) => void;
}) {
  if (!onSetNodeProgress) return null;

  return (
    <Button
      size="sm"
      variant={completed ? "secondary" : "outline"}
      disabled={disabled}
      onClick={() => onSetNodeProgress(Number(nodeId), completed ? 0 : 100)}
    >
      {completed ? <CircleCheck /> : <Check />}
      {completed ? "Completed" : "Mark complete"}
    </Button>
  );
}

function MarkdownNode({
  node,
  depth,
  progressByNodeId,
  progressDisabled,
  onSetNodeProgress,
}: {
  node: CourseNode;
  depth: number;
  progressByNodeId: Map<string, number>;
  progressDisabled: boolean;
  onSetNodeProgress?: (nodeId: number, percentage: number) => void;
}) {
  const Heading = depth === 0 ? "h2" : depth === 1 ? "h3" : "h4";
  const completed = progressByNodeId.get(node.id) === 100;

  return (
    <article className="space-y-2">
      <Heading className="text-xl font-semibold">{node.title}</Heading>
      <MarkdownContent content={node.content} />
      <ProgressToggle
        nodeId={node.id}
        completed={completed}
        disabled={progressDisabled}
        onSetNodeProgress={onSetNodeProgress}
      />
      {node.children.length > 0 && (
        <div className="space-y-8 border-l pl-5">
          {node.children.map((child) => (
            <MarkdownNode
              key={child.id}
              node={child}
              depth={depth + 1}
              progressByNodeId={progressByNodeId}
              progressDisabled={progressDisabled}
              onSetNodeProgress={onSetNodeProgress}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function flattenNodes(nodes: CourseNode[]): CourseNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children)]);
}

export function CourseContentReader({
  course,
  isLoading = false,
  error = null,
  onRetry,
  nodeProgress = [],
  isProgressLoading = false,
  progressError = null,
  onRetryProgress,
  isSavingProgress = false,
  onSetNodeProgress,
}: CourseContentReaderProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">{error}</p>
        {onRetry && (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!course) return null;

  const isStepByStep = course.type === "STEP_BY_STEP";
  const allNodes = flattenNodes(course.nodes);
  const steps = isStepByStep ? allNodes : [];
  const currentStep = steps[activeStep];
  const progressByNodeId = new Map(
    nodeProgress.map((progress) => [progress.nodeId, progress.percentage]),
  );
  const completedNodes = allNodes.filter(
    (node) => progressByNodeId.get(node.id) === 100,
  ).length;
  const completionPercentage =
    allNodes.length === 0
      ? 0
      : Math.round((completedNodes / allNodes.length) * 100);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3 border-b pb-6">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {course.type.replaceAll("_", " ")}
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <Link
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            to={Routes.USER_PROFILE.replace(
              ":userId",
              String(course.author.id),
            )}
          >
            {course.author.picturePath && (
              <img
                src={course.author.picturePath}
                alt=""
                className="size-6 rounded-full object-cover"
              />
            )}
            <span>By {course.author.name}</span>
          </Link>
          {course.description && (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {course.description}
            </p>
          )}
          {course.tags.length > 0 && (
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
          )}
        </header>

        {allNodes.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium">
                {isStepByStep && steps.length > 0
                  ? `Step ${activeStep + 1} of ${steps.length}`
                  : "Course progress"}
              </span>
              <span className="text-muted-foreground">
                {completedNodes} of {allNodes.length} completed ·{" "}
                {completionPercentage}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Course progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercentage}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </section>
        )}

        {(isProgressLoading || progressError) && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            {isProgressLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading your progress…
              </p>
            ) : (
              <p className="text-sm text-destructive">{progressError}</p>
            )}
            {progressError && onRetryProgress && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRetryProgress}
              >
                Retry
              </Button>
            )}
          </div>
        )}

        {isStepByStep ? (
          steps.length > 0 && currentStep ? (
            <section className="space-y-6">
              <article className="space-y-4">
                <h2 className="text-2xl font-semibold">{currentStep.title}</h2>
                <MarkdownContent
                  key={currentStep.id}
                  content={currentStep.content}
                />
              </article>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((step) => step - 1)}
                >
                  <ArrowLeft />
                  Previous
                </Button>
                {onSetNodeProgress && (
                  <Button
                    variant={
                      progressByNodeId.get(currentStep.id) === 100
                        ? "secondary"
                        : "default"
                    }
                    disabled={
                      isSavingProgress ||
                      isProgressLoading ||
                      Boolean(progressError)
                    }
                    onClick={() =>
                      onSetNodeProgress(
                        Number(currentStep.id),
                        progressByNodeId.get(currentStep.id) === 100 ? 0 : 100,
                      )
                    }
                  >
                    {isSavingProgress ? (
                      <LoaderCircle className="animate-spin" />
                    ) : progressByNodeId.get(currentStep.id) === 100 ? (
                      <CircleCheck />
                    ) : (
                      <Check />
                    )}
                    {progressByNodeId.get(currentStep.id) === 100
                      ? "Completed"
                      : "Mark complete"}
                  </Button>
                )}
                <Button
                  disabled={activeStep === steps.length - 1}
                  onClick={() => setActiveStep((step) => step + 1)}
                >
                  Next
                  <ArrowRight />
                </Button>
              </div>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">
              This course does not have any steps yet.
            </p>
          )
        ) : course.nodes.length > 0 ? (
          <div className="space-y-10">
            {course.nodes.map((node) => (
              <MarkdownNode
                key={node.id}
                node={node}
                depth={0}
                progressByNodeId={progressByNodeId}
                progressDisabled={
                  isSavingProgress ||
                  isProgressLoading ||
                  Boolean(progressError)
                }
                onSetNodeProgress={onSetNodeProgress}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This course does not have any notes yet.
          </p>
        )}
      </article>
    </main>
  );
}

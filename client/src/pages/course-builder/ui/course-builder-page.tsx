import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  FilePlus2,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCourseQuery } from "@/entities/course/api/course.queries";
import { useTagsQuery } from "@/entities/tag/api/tag.queries";
import {
  useCreateNodeMutation,
  useDeleteNodeMutation,
  useNodesQuery,
  useUpdateNodeMutation,
  type CourseNode,
} from "@/entities/node";
import { cn } from "@/lib/utils";
import { CourseTagsEditor } from "@/features/course/edit-course-tags";

function findNode(nodes: CourseNode[], id: string | null): CourseNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNode(node.children, id);
    if (child) return child;
  }
  return null;
}

export function CourseBuilderPage() {
  const { courseId = "" } = useParams();
  const numericCourseId = Number(courseId);
  const validCourseId =
    Number.isInteger(numericCourseId) && numericCourseId > 0;
  const course = useCourseQuery(courseId);
  const nodes = useNodesQuery(validCourseId ? numericCourseId : null);
  const createNode = useCreateNodeMutation(numericCourseId);
  const updateNode = useUpdateNodeMutation(numericCourseId);
  const deleteNode = useDeleteNodeMutation(numericCourseId);
  const { data: tags = [], isLoading: isTagsLoading } = useTagsQuery();
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<CourseNode | null>(null);

  const activeNode = useMemo(
    () => findNode(nodes.data ?? [], activeNodeId),
    [nodes.data, activeNodeId],
  );

  useEffect(() => {
    if (nodes.data && activeNodeId && !findNode(nodes.data, activeNodeId)) {
      setActiveNodeId(nodes.data[0]?.id ?? null);
    }
  }, [nodes.data, activeNodeId]);

  if (!validCourseId) {
    return (
      <BuilderMessage
        title="Invalid course"
        description="The course identifier is not valid."
      />
    );
  }

  if (course.isLoading) return <BuilderSkeleton />;
  if (course.isError) {
    return (
      <BuilderMessage
        title="Could not load course"
        description={course.error.message}
        retry={() => course.refetch()}
      />
    );
  }
  if (!course.data) return null;

  const addNode = (parent: CourseNode | null) => {
    const siblings = parent ? parent.children : (nodes.data ?? []);
    createNode.mutate(
      {
        title: "Untitled node",
        content: "",
        position: siblings.length,
        parentId: parent ? Number(parent.id) : null,
      },
      {
        onSuccess: (node) => setActiveNodeId(node.id),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const confirmDelete = () => {
    if (!nodeToDelete) return;
    deleteNode.mutate(nodeToDelete.id, {
      onSuccess: () => {
        if (activeNodeId === nodeToDelete.id) setActiveNodeId(null);
        setNodeToDelete(null);
        toast.success("Node deleted");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {course.data.title}
            </h1>
            {course.data.description && (
              <p className="text-sm text-muted-foreground">
                {course.data.description}
              </p>
            )}
          </div>
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {course.data.type}
          </span>
        </header>

        <div className="grid min-h-[620px] flex-1 overflow-hidden rounded-xl border lg:grid-cols-[280px_minmax(0,1fr)_240px]">
          <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between border-b p-3">
              <h2 className="font-medium">Course tree</h2>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Add root node"
                onClick={() => addNode(null)}
                disabled={createNode.isPending}
              >
                {createNode.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Plus />
                )}
              </Button>
            </div>
            <ScrollArea className="min-h-0 flex-1 p-2">
              {nodes.isLoading && <TreeSkeleton />}
              {nodes.isError && (
                <p className="p-2 text-sm text-destructive">
                  {nodes.error.message}
                </p>
              )}
              {!nodes.isLoading &&
                !nodes.isError &&
                nodes.data?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No nodes yet. Add the first one to start outlining the
                    course.
                  </div>
                )}
              {nodes.data?.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  activeId={activeNodeId}
                  onSelect={setActiveNodeId}
                  onAddChild={addNode}
                />
              ))}
            </ScrollArea>
          </section>

          <section className="min-h-0 border-b lg:border-r lg:border-b-0">
            {activeNode ? (
              <NodeEditor
                node={activeNode}
                isSaving={updateNode.isPending}
                onSave={(input) =>
                  updateNode.mutate(
                    { id: activeNode.id, input },
                    {
                      onSuccess: () => toast.success("Node saved"),
                      onError: (error) => toast.error(error.message),
                    },
                  )
                }
                onDelete={() => setNodeToDelete(activeNode)}
              />
            ) : (
              <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
                <FilePlus2 className="size-8 text-muted-foreground" />
                <div>
                  <h2 className="font-medium">Select a node to edit</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a node in the tree or create a new one.
                  </p>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5 p-4 text-sm">
            <div>
              <h2 className="mb-2 font-medium">Properties</h2>
              <p className="text-muted-foreground">
                Created {new Date(course.data.createdAt).toLocaleDateString()}
              </p>
            </div>
            <CourseTagsEditor
              courseId={courseId}
              tags={course.data.tags}
              availableTags={tags}
              isLoading={isTagsLoading}
            />
            <PropertyList
              title="Skills"
              values={course.data.skills.map((skill) => skill.name)}
            />
            <div>
              <h3 className="mb-2 font-medium">Last updated</h3>
              <p className="text-muted-foreground">
                {new Date(course.data.updatedAt).toLocaleString()}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <AlertDialog
        open={nodeToDelete !== null}
        onOpenChange={(open) => !open && setNodeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{nodeToDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Its children will remain in the course and become root nodes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteNode.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function TreeNode({
  node,
  activeId,
  onSelect,
  onAddChild,
}: {
  node: CourseNode;
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (node: CourseNode) => void;
}) {
  return (
    <div>
      <div className="group flex items-center gap-1">
        <Button
          variant="ghost"
          className={cn(
            "h-8 min-w-0 flex-1 justify-start px-2 text-left",
            activeId === node.id && "bg-accent",
          )}
          onClick={() => onSelect(node.id)}
        >
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="truncate">{node.title}</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Add child to ${node.title}`}
          onClick={() => onAddChild(node)}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      {node.children.length > 0 && (
        <div className="ml-4 border-l pl-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeEditor({
  node,
  isSaving,
  onSave,
  onDelete,
}: {
  node: CourseNode;
  isSaving: boolean;
  onSave: (input: { title: string; content: string }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  useEffect(() => {
    setTitle(node.title);
    setContent(node.content);
  }, [node.id, node.title, node.content]);
  const changed = title !== node.title || content !== node.content;
  return (
    <div className="flex h-full min-h-[420px] flex-col p-4">
      <div className="mb-4 flex items-center gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Node title"
        />
        <Button
          size="sm"
          onClick={() => onSave({ title: title.trim(), content })}
          disabled={!title.trim() || !changed || isSaving}
        >
          {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />} Save
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          aria-label="Delete node"
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>
      <Textarea
        className="min-h-80 flex-1 font-mono"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write Markdown content…"
        aria-label="Node Markdown content"
      />
    </div>
  );
}

function PropertyList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      {values.length ? (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <span key={value} className="rounded bg-muted px-2 py-1 text-xs">
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">None</p>
      )}
    </div>
  );
}
function BuilderMessage({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="space-y-3 text-center">
        <h1 className="font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {retry && <Button onClick={retry}>Try again</Button>}
      </div>
    </main>
  );
}
function BuilderSkeleton() {
  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-[620px] w-full" />
      </div>
    </main>
  );
}
function TreeSkeleton() {
  return (
    <div className="space-y-2 p-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="h-8 w-3/5" />
    </div>
  );
}

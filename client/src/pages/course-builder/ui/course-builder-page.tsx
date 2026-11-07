import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useCourseQuery } from "@/entities/course/api/course.queries";
import { useUpdateCourseMutation } from "@/entities/course/api/course.mutations";
import { usePublishCourseMutation } from "@/entities/course/api/course.mutations";
import { useTagsQuery } from "@/entities/tag/api/tag.queries";
import {
  useCreateNodeMutation,
  useDeleteNodeMutation,
  useMoveNodeMutation,
  useNodesQuery,
  useUpdateNodeMutation,
  useUpdateNodeSkillsMutation,
  useUpdateNodeTagsMutation,
  type CourseNode,
} from "@/entities/node";
import { useSkillsQuery } from "@/entities/skill/api/skill.queries";
import { BuilderMessage, BuilderSkeleton } from "../components/builder-states";
import { CourseHeader } from "../components/course-header";
import { EditCourseDialog } from "../components/edit-course-dialog";
import { CourseTreePanel } from "../components/course-tree-panel";
import { DeleteNodeDialog } from "../components/delete-node-dialog";
import { NodeEditorPanel } from "../components/node-editor-panel";
import { findNode } from "../lib/find-node";
import { Routes } from "@/shared/routing/routes";

export function CourseBuilderPage() {
  const { courseId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const numericCourseId = Number(courseId);
  const validCourseId =
    Number.isInteger(numericCourseId) && numericCourseId > 0;

  const course = useCourseQuery(courseId);
  const updateCourse = useUpdateCourseMutation();
  const publishCourse = usePublishCourseMutation();
  const nodes = useNodesQuery(validCourseId ? numericCourseId : null);

  const createNode = useCreateNodeMutation(numericCourseId);
  const moveNode = useMoveNodeMutation(numericCourseId);
  const updateNode = useUpdateNodeMutation(numericCourseId);
  const updateNodeTags = useUpdateNodeTagsMutation(numericCourseId);
  const updateNodeSkills = useUpdateNodeSkillsMutation(numericCourseId);
  const { mutateAsync: updateNodeTagsAsync } = updateNodeTags;
  const { mutateAsync: updateNodeSkillsAsync } = updateNodeSkills;
  const deleteNode = useDeleteNodeMutation(numericCourseId);

  const { data: tags = [], isLoading: isTagsLoading } = useTagsQuery();
  const { data: skills = [], isLoading: isSkillsLoading } = useSkillsQuery();

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<CourseNode | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCourseDetailsOpen, setIsCourseDetailsOpen] = useState(false);
  const quickNoteCreationAttemptedFor = useRef<string | null>(null);
  const initialMetadata = useRef<{
    tagIds: number[];
    skillIds: number[];
  } | null>(null);

  useEffect(() => {
    const state = location.state as {
      initialTagIds?: unknown;
      initialSkillIds?: unknown;
    } | null;
    initialMetadata.current = {
      tagIds: Array.isArray(state?.initialTagIds)
        ? state.initialTagIds.map(Number).filter(Number.isSafeInteger)
        : [],
      skillIds: Array.isArray(state?.initialSkillIds)
        ? state.initialSkillIds.map(Number).filter(Number.isSafeInteger)
        : [],
    };
  }, [location.key, location.state]);

  const applyInitialMetadata = useCallback(async (node: CourseNode) => {
    const metadata = initialMetadata.current;
    if (
      !metadata ||
      (metadata.tagIds.length === 0 && metadata.skillIds.length === 0)
    ) {
      initialMetadata.current = null;
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    initialMetadata.current = null;
    navigate(location.pathname, { replace: true, state: null });

    await Promise.all([
      ...(metadata.tagIds.length > 0
        ? [updateNodeTagsAsync({ id: node.id, tagIds: metadata.tagIds })]
        : []),
      ...(metadata.skillIds.length > 0
        ? [
            updateNodeSkillsAsync({
              id: node.id,
              skillIds: metadata.skillIds,
            }),
          ]
        : []),
    ]);
  }, [
    location.pathname,
    navigate,
    updateNodeSkillsAsync,
    updateNodeTagsAsync,
  ]);

  const activeNode = useMemo(
    () =>
      course.data?.type === "QUICK_NOTE"
        ? (nodes.data?.[0] ?? null)
        : findNode(nodes.data ?? [], activeNodeId),
    [course.data?.type, nodes.data, activeNodeId],
  );

  const selectNode = useCallback((node: CourseNode) => {
    setActiveNodeId(node.id);
    setTitle(node.title);
    setContent(node.content);
  }, []);

  function clearSelection() {
    setActiveNodeId(null);
    setTitle("");
    setContent("");
  }

  function changeNodeTitle(value: string) {
    if (
      course.data?.type === "QUICK_NOTE" &&
      activeNodeId === null &&
      activeNode
    ) {
      setActiveNodeId(activeNode.id);
    }
    setTitle(value);
  }

  function changeNodeContent(value: string) {
    if (
      course.data?.type === "QUICK_NOTE" &&
      activeNodeId === null &&
      activeNode
    ) {
      setActiveNodeId(activeNode.id);
    }
    setContent(value);
  }

  function addNode(parent: CourseNode | null) {
    const siblings = parent ? parent.children : (nodes.data ?? []);

    createNode.mutate(
      {
        title: "Untitled node",
        content: "",
        position: siblings.length,
        parentId: parent ? Number(parent.id) : null,
      },
      {
        onSuccess: (node) => {
          selectNode(node);
          void applyInitialMetadata(node)
            .then(() => toast.success("Node created"))
            .catch((error: unknown) =>
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to save metadata.",
              ),
            );
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function addFreeFormNote() {
    createNode.mutate(
      {
        title: "Untitled note",
        content: "",
        position: (nodes.data ?? []).length,
        parentId: null,
      },
      {
        onSuccess: (node) => {
          selectNode(node);
          void applyInitialMetadata(node)
            .then(() => toast.success("Note created"))
            .catch((error: unknown) =>
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to save metadata.",
              ),
            );
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  const createQuickNote = useCallback(() => {
    quickNoteCreationAttemptedFor.current = courseId;
    createNode.mutate(
      {
        title: course.data?.title ?? "Quick note",
        content: "",
        position: 0,
        parentId: null,
      },
      {
        onSuccess: (node) => {
          selectNode(node);
          void applyInitialMetadata(node)
            .then(() => toast.success("Note created"))
            .catch((error: unknown) =>
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to save metadata.",
              ),
            );
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }, [
    applyInitialMetadata,
    course.data?.title,
    courseId,
    createNode,
    selectNode,
  ]);

  useEffect(() => {
    if (
      course.data?.type === "QUICK_NOTE" &&
      nodes.isSuccess &&
      nodes.data.length === 0 &&
      !createNode.isPending &&
      quickNoteCreationAttemptedFor.current !== courseId
    ) {
      createQuickNote();
    }
  }, [
    course.data?.type,
    nodes.isSuccess,
    nodes.data,
    createNode.isPending,
    courseId,
    createQuickNote,
  ]);

  function handleMoveNode(
    draggedNodeId: string,
    targetNode: CourseNode,
    placement: "before" | "inside",
  ) {
    const tree = nodes.data ?? [];
    const draggedNode = findNode(tree, draggedNodeId);
    if (!draggedNode || draggedNode.id === targetNode.id) return;
    if (findNode(draggedNode.children, targetNode.id)) return;
    if (course.data?.type === "FREE_FORM" && placement === "inside") return;

    let parentId: number | null;
    let siblings: CourseNode[];
    let position: number;

    if (placement === "inside") {
      parentId = Number(targetNode.id);
      siblings = targetNode.children.filter(
        (sibling) => sibling.id !== draggedNode.id,
      );
      position = siblings.length;
    } else {
      parentId = targetNode.parentId;
      const parent =
        parentId === null ? null : findNode(tree, String(parentId));
      siblings = (parent ? parent.children : tree).filter(
        (sibling) => sibling.id !== draggedNode.id,
      );
      const targetIndex = siblings.findIndex(
        (sibling) => sibling.id === targetNode.id,
      );
      if (targetIndex === -1) return;
      position = targetIndex;
    }

    const currentSiblings =
      draggedNode.parentId === null
        ? tree
        : (findNode(tree, String(draggedNode.parentId))?.children ?? []);
    const currentPosition = currentSiblings.findIndex(
      (sibling) => sibling.id === draggedNode.id,
    );
    if (draggedNode.parentId === parentId && currentPosition === position) {
      return;
    }

    moveNode.mutate(
      {
        id: draggedNode.id,
        input: { parentId, position },
      },
      {
        onSuccess: () => toast.success("Node moved"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleMoveNodeToRoot(
    draggedNodeId: string,
    position: "start" | "end",
  ) {
    const tree = nodes.data ?? [];
    const draggedNode = findNode(tree, draggedNodeId);
    if (!draggedNode) return;

    const rootsWithoutDraggedNode = tree.filter(
      (node) => node.id !== draggedNode.id,
    );
    const targetPosition =
      position === "start" ? 0 : rootsWithoutDraggedNode.length;
    const currentPosition = tree.findIndex(
      (node) => node.id === draggedNode.id,
    );

    if (draggedNode.parentId === null && currentPosition === targetPosition) {
      return;
    }

    moveNode.mutate(
      {
        id: draggedNode.id,
        input: { parentId: null, position: targetPosition },
      },
      {
        onSuccess: () => toast.success("Node moved"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function confirmDelete() {
    if (!nodeToDelete) return;

    const deletingActiveNode = activeNodeId === nodeToDelete.id;

    deleteNode.mutate(nodeToDelete.id, {
      onSuccess: () => {
        if (deletingActiveNode) {
          setActiveNodeId(null);
          setTitle("");
          setContent("");
        }

        setNodeToDelete(null);
        toast.success("Node deleted");
      },
      onError: (error) => toast.error(error.message),
    });
  }

  async function saveCourseDetails(input: {
    title: string;
    description: string;
  }) {
    try {
      await updateCourse.mutateAsync({
        id: courseId,
        input,
      });
      await course.refetch();
      toast.success("Course details saved");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save course details.",
      );
      throw error;
    }
  }

  function saveActiveNode(input: { title: string; content: string }) {
    if (!activeNode) return;

    updateNode.mutate(
      {
        id: activeNode.id,
        input,
      },
      {
        onSuccess: () => toast.success("Node saved"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function finishCourse() {
    if (nodes.isLoading || !nodes.data?.length) {
      toast.error("Add at least one note before publishing the course.");
      return;
    }

    publishCourse.mutate(courseId, {
      onSuccess: () => {
        toast.success("Course published and added to the catalog.");
        navigate(Routes.COURSE_READER.replace(":courseId", courseId), {
          replace: true,
        });
      },
      onError: (error) => toast.error(error.message),
    });
  }

  if (!validCourseId) {
    return (
      <BuilderMessage
        title="Invalid course"
        description="The course identifier is not valid."
      />
    );
  }

  if (course.isLoading) {
    return <BuilderSkeleton />;
  }

  if (course.isError) {
    return (
      <BuilderMessage
        title="Could not load course"
        description={course.error.message}
        retry={() => void course.refetch()}
      />
    );
  }

  if (!course.data) {
    return (
      <BuilderMessage
        title="Course not found"
        description="The course does not exist or is not available to you."
      />
    );
  }

  const courseData = course.data;

  return (
    <main className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
        <CourseHeader
          courseId={courseId}
          title={courseData.title}
          description={courseData.description}
          courseType={courseData.type}
          createdAt={courseData.createdAt}
          updatedAt={courseData.updatedAt}
          courseTags={courseData.tags}
          courseSkills={courseData.skills}
          availableTags={tags}
          availableSkills={skills}
          isTagsLoading={isTagsLoading}
          isSkillsLoading={isSkillsLoading}
          hasNodes={(nodes.data?.length ?? 0) > 0}
          isPublished={courseData.isPublished}
          isPublishing={publishCourse.isPending}
          onEdit={() => setIsCourseDetailsOpen(true)}
          onPublish={finishCourse}
        />

        <div
          className={`grid min-h-[620px] flex-1 overflow-hidden rounded-xl border ${
            courseData.type === "QUICK_NOTE"
              ? "grid-cols-1"
              : "lg:grid-cols-[260px_minmax(0,1fr)]"
          }`}
        >
          {courseData.type === "QUICK_NOTE" ? (
            activeNode ? (
              <NodeEditorPanel
                node={activeNode}
                availableTags={tags}
                availableSkills={skills}
                isTagsLoading={isTagsLoading}
                isSkillsLoading={isSkillsLoading}
                title={
                  activeNodeId === null ? (activeNode?.title ?? title) : title
                }
                content={
                  activeNodeId === null
                    ? (activeNode?.content ?? content)
                    : content
                }
                isSaving={updateNode.isPending}
                showDelete={false}
                onTitleChange={changeNodeTitle}
                onContentChange={changeNodeContent}
                onSave={saveActiveNode}
              />
            ) : (
              <section className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                {nodes.isError || createNode.isError ? (
                  <BuilderMessage
                    title={
                      nodes.isError
                        ? "Could not load note"
                        : "Could not create note"
                    }
                    description={
                      nodes.isError
                        ? nodes.error.message
                        : (createNode.error?.message ??
                          "The note could not be created.")
                    }
                    retry={() => {
                      if (nodes.isError) {
                        void nodes.refetch();
                        return;
                      }
                      quickNoteCreationAttemptedFor.current = null;
                      createQuickNote();
                    }}
                  />
                ) : (
                  <>
                    <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Creating your note…
                    </p>
                  </>
                )}
              </section>
            )
          ) : (
            <>
              <CourseTreePanel
                nodes={nodes.data ?? []}
                isLoading={nodes.isLoading}
                error={nodes.isError ? nodes.error.message : null}
                activeNodeId={activeNodeId}
                isCreating={createNode.isPending}
                isMoving={moveNode.isPending}
                onAddNode={() =>
                  courseData.type === "FREE_FORM"
                    ? addFreeFormNote()
                    : addNode(activeNode)
                }
                onSelectNode={selectNode}
                onClearSelection={clearSelection}
                onDeleteNode={setNodeToDelete}
                onMoveNodeToRoot={handleMoveNodeToRoot}
                onMoveNode={handleMoveNode}
                title={courseData.type === "FREE_FORM" ? "Notes" : undefined}
                addNodeLabel={
                  courseData.type === "FREE_FORM" ? "Add note" : undefined
                }
                emptyMessage={
                  courseData.type === "FREE_FORM"
                    ? "No notes yet. Add a note to collect ideas and references."
                    : undefined
                }
                allowNesting={courseData.type !== "FREE_FORM"}
              />

              <NodeEditorPanel
                node={activeNode}
                availableTags={tags}
                availableSkills={skills}
                isTagsLoading={isTagsLoading}
                isSkillsLoading={isSkillsLoading}
                onCreateNode={() =>
                  courseData.type === "FREE_FORM"
                    ? addFreeFormNote()
                    : addNode(null)
                }
                title={title}
                content={content}
                isSaving={updateNode.isPending}
                titlePlaceholder={
                  courseData.type === "FREE_FORM"
                    ? "Название заметки"
                    : undefined
                }
                deleteLabel={
                  courseData.type === "FREE_FORM"
                    ? "Удалить заметку"
                    : undefined
                }
                onTitleChange={setTitle}
                onContentChange={setContent}
                onSave={saveActiveNode}
                onDelete={() => {
                  if (activeNode) setNodeToDelete(activeNode);
                }}
              />
            </>
          )}
        </div>
      </div>

      <EditCourseDialog
        open={isCourseDetailsOpen}
        onOpenChange={setIsCourseDetailsOpen}
        title={courseData.title}
        description={courseData.description}
        isSaving={updateCourse.isPending}
        onSave={saveCourseDetails}
      />

      <DeleteNodeDialog
        node={nodeToDelete}
        isDeleting={deleteNode.isPending}
        onClose={() => setNodeToDelete(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

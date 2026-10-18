import { useMemo, useState } from "react";

import { useParams } from "react-router";
import { toast } from "sonner";

import { useCourseQuery } from "@/entities/course/api/course.queries";
import { useUpdateCourseMutation } from "@/entities/course/api/course.mutations";
import { useTagsQuery } from "@/entities/tag/api/tag.queries";
import {
  useCreateNodeMutation,
  useDeleteNodeMutation,
  useNodesQuery,
  useUpdateNodeMutation,
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

export function CourseBuilderPage() {
  const { courseId = "" } = useParams();

  const numericCourseId = Number(courseId);
  const validCourseId =
    Number.isInteger(numericCourseId) && numericCourseId > 0;

  const course = useCourseQuery(courseId);
  const updateCourse = useUpdateCourseMutation();
  const nodes = useNodesQuery(validCourseId ? numericCourseId : null);

  const createNode = useCreateNodeMutation(numericCourseId);
  const updateNode = useUpdateNodeMutation(numericCourseId);
  const deleteNode = useDeleteNodeMutation(numericCourseId);

  const { data: tags = [], isLoading: isTagsLoading } = useTagsQuery();
  const { data: skills = [], isLoading: isSkillsLoading } = useSkillsQuery();

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<CourseNode | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCourseDetailsOpen, setIsCourseDetailsOpen] = useState(false);

  const activeNode = useMemo(
    () => findNode(nodes.data ?? [], activeNodeId),
    [nodes.data, activeNodeId],
  );

  function selectNode(node: CourseNode) {
    setActiveNodeId(node.id);
    setTitle(node.title);
    setContent(node.content);
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
          toast.success("Node created");
        },
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
          onEdit={() => setIsCourseDetailsOpen(true)}
        />

        <div className="grid min-h-[620px] flex-1 overflow-hidden rounded-xl border lg:grid-cols-[260px_minmax(0,1fr)]">
          <CourseTreePanel
            nodes={nodes.data ?? []}
            isLoading={nodes.isLoading}
            error={nodes.isError ? nodes.error.message : null}
            activeNodeId={activeNodeId}
            isCreating={createNode.isPending}
            onAddRoot={() => addNode(null)}
            onSelectNode={selectNode}
            onAddChild={addNode}
            onDeleteNode={setNodeToDelete}
          />

          <NodeEditorPanel
            node={activeNode}
            title={title}
            content={content}
            isSaving={updateNode.isPending}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onSave={saveActiveNode}
            onDelete={() => {
              if (activeNode) setNodeToDelete(activeNode);
            }}
          />
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

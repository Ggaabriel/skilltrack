import { Check, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateCourseTagsMutation } from "@/entities/course/api/course.mutations";
import type { CourseTag } from "@/entities/course/api/types";
import type { Tag } from "@/entities/tag/api/tag.api";
import {
  useCreateTagMutation,
  useUpdateTagMutation,
} from "@/entities/tag/api/tag.mutations";

type DraftTag = CourseTag & { originalName?: string };

type CourseTagsEditorProps = {
  courseId: string;
  tags: CourseTag[];
  availableTags: Tag[];
  isLoading?: boolean;
};

export function CourseTagsEditor({
  courseId,
  tags,
  availableTags,
  isLoading = false,
}: CourseTagsEditorProps) {
  const [draftTags, setDraftTags] = useState<DraftTag[]>(tags);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const updateCourseTags = useUpdateCourseTagsMutation();
  const createTag = useCreateTagMutation();
  const updateTag = useUpdateTagMutation();

  useEffect(() => {
    setDraftTags(tags);
    setEditingId(null);
    setInput("");
  }, [tags]);

  const hasChanges = useMemo(
    () =>
      draftTags.length !== tags.length ||
      draftTags.some(
        (tag, index) =>
          tag.id !== tags[index]?.id || tag.name !== tags[index]?.name,
      ),
    [draftTags, tags],
  );

  const searchResults = useMemo(
    () => findMatches(availableTags, input, draftTags),
    [availableTags, input, draftTags],
  );

  const editingResults = useMemo(
    () => findMatches(availableTags, editingValue, draftTags, editingId),
    [availableTags, editingValue, draftTags, editingId],
  );

  const addTag = (tag: Tag) => {
    if (draftTags.some((draftTag) => draftTag.id === tag.id)) return;
    setDraftTags((current) => [...current, tag]);
    setInput("");
  };

  const addTypedTag = () => {
    const name = input.trim();
    if (!name) return;

    const existing = availableTags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      addTag(existing);
      return;
    }

    setDraftTags((current) => [
      ...current,
      { id: -Date.now(), name },
    ]);
    setInput("");
  };

  const beginEdit = (tag: DraftTag) => {
    setEditingId(tag.id);
    setEditingValue(tag.name);
  };

  const confirmEdit = () => {
    const name = editingValue.trim();
    if (!name || editingId === null) return;

    const replacement = availableTags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
    setDraftTags((current) =>
      current.map((tag) =>
        tag.id !== editingId
          ? tag
          : replacement ?? {
              ...tag,
              name,
              originalName: tag.originalName ?? tag.name,
            },
      ),
    );
    setEditingId(null);
    setEditingValue("");
  };

  const save = async () => {
    try {
      const resolvedTags = await Promise.all(
        draftTags.map(async (tag) => {
          if (tag.id < 0) return createTag.mutateAsync(tag.name);
          if (tag.originalName && tag.originalName !== tag.name) {
            return updateTag.mutateAsync({ id: tag.id, name: tag.name });
          }
          return tag;
        }),
      );

      await updateCourseTags.mutateAsync({
        id: courseId,
        tagIds: resolvedTags.map((tag) => tag.id),
      });
      toast.success("Tags saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tags.");
    }
  };

  const isSaving =
    updateCourseTags.isPending || createTag.isPending || updateTag.isPending;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-medium">Tags</h3>
        {hasChanges && (
          <div className="flex items-center gap-1">
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Discard tag changes"
              disabled={isSaving}
              onClick={() => setDraftTags(tags)}
            >
              <X />
            </Button>
            <Button
              size="icon-xs"
              aria-label="Save tag changes"
              disabled={isSaving}
              onClick={() => void save()}
            >
              <Save />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {draftTags.map((tag) =>
            editingId === tag.id ? (
              <TagInput
                key={tag.id}
                value={editingValue}
                onChange={setEditingValue}
                results={editingResults}
                onPick={(replacement) => {
                  setEditingValue(replacement.name);
                }}
                onConfirm={confirmEdit}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
              >
                <button
                  type="button"
                  className="max-w-28 truncate text-left hover:text-foreground"
                  onClick={() => beginEdit(tag)}
                  aria-label={`Edit ${tag.name}`}
                >
                  {tag.name}
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setDraftTags((current) =>
                      current.filter((draftTag) => draftTag.id !== tag.id),
                    )
                  }
                  aria-label={`Remove ${tag.name} from course`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ),
          )}
        </div>

        <TagInput
          value={input}
          placeholder={isLoading ? "Loading tags..." : "Add a tag"}
          onChange={setInput}
          results={searchResults}
          onPick={addTag}
          onConfirm={addTypedTag}
          disabled={isLoading || isSaving}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Click a tag to edit it. Names are global and affect every course using
        that tag.
      </p>
    </section>
  );
}

function TagInput({
  value,
  onChange,
  results,
  onPick,
  onConfirm,
  onCancel,
  placeholder = "",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  results: Tag[];
  onPick: (tag: Tag) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-1">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onConfirm();
          }
          if (event.key === "Escape" && onCancel) onCancel();
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="h-7 min-w-24 text-xs"
      />
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Confirm tag"
        onClick={onConfirm}
        disabled={disabled || !value.trim()}
      >
        <Check />
      </Button>
      {onCancel && (
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Cancel tag edit"
          onClick={onCancel}
          disabled={disabled}
        >
          <X />
        </Button>
      )}
      {value.trim() && results.length > 0 && (
        <div className="absolute top-8 z-10 w-full overflow-hidden rounded-md border bg-popover p-1 shadow-md">
          {results.slice(0, 5).map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs hover:bg-muted"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(tag)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function findMatches(
  tags: Tag[],
  query: string,
  selectedTags: DraftTag[],
  editingId?: number | null,
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(normalizedQuery) &&
      (tag.id === editingId ||
        !selectedTags.some((selectedTag) => selectedTag.id === tag.id)),
  );
}

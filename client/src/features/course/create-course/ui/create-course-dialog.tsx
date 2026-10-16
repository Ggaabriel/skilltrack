import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Routes } from "@/shared/routing/routes";

import {
  createCourseSchema,
  type CreateCourseFormValues,
} from "../model/schemas";
import { useCreateCourseMutation } from "../api/create-course.mutation";

import { useTagsQuery } from "@/entities/tag/api/tag.queries";
import { useSkillsQuery } from "@/entities/skill/api/skill.queries";

import {
  useUpdateCourseSkillsMutation,
  useUpdateCourseTagsMutation,
} from "@/entities/course/api/course.mutations";

import { useCreateTagMutation } from "@/entities/tag/api/tag.mutations";

import { useCreateSkillMutation } from "@/entities/skill/api/skill.mutations";

import { CreatableMultiSelect } from "./creatable-multi-select";

export function CreateCourseDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const createCourseMutation = useCreateCourseMutation();

  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "STEP_BY_STEP",
    },
  });

  async function onSubmit(values: CreateCourseFormValues) {
    try {
      const course = await createCourseMutation.mutateAsync(values);

      await Promise.all([
        updateCourseTagsMutation.mutateAsync({
          id: course.id,
          tagIds: selectedTagIds,
        }),

        updateCourseSkillsMutation.mutateAsync({
          id: course.id,
          skillIds: selectedSkillIds,
        }),
      ]);

      form.reset();
      setSelectedTagIds([]);
      setSelectedSkillIds([]);

      createCourseMutation.reset();
      updateCourseTagsMutation.reset();
      updateCourseSkillsMutation.reset();

      setOpen(false);

      navigate(`${Routes.COURSES}/${course.id}/builder`);
    } catch {
      // Ошибка отображается ниже формы
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (createCourseMutation.isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset();
      createCourseMutation.reset();
    }
  }

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  const { data: tags = [], isLoading: isTagsLoading } = useTagsQuery();

  const { data: skills = [], isLoading: isSkillsLoading } = useSkillsQuery();

  const updateCourseTagsMutation = useUpdateCourseTagsMutation();
  const updateCourseSkillsMutation = useUpdateCourseSkillsMutation();

  const isSubmitting =
    createCourseMutation.isPending ||
    updateCourseTagsMutation.isPending ||
    updateCourseSkillsMutation.isPending;

  const createTagMutation = useCreateTagMutation();
  const createSkillMutation = useCreateSkillMutation();
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create course
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create course</DialogTitle>

          <DialogDescription>
            Create a course and start building its content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="e.g. React fundamentals"
                      disabled={createCourseMutation.isPending}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="What is this course about?"
                      className="resize-none"
                      rows={4}
                      disabled={createCourseMutation.isPending}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>

                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={createCourseMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="QUICK_NOTE">Quick note</SelectItem>

                      <SelectItem value="STEP_BY_STEP">Step by step</SelectItem>

                      <SelectItem value="FREE_FORM">Free form</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <CreatableMultiSelect
              label="Tags"
              placeholder="Select or create tags"
              searchPlaceholder="Search or enter a tag..."
              createLabel="Create tag"
              items={tags}
              selectedIds={selectedTagIds}
              onSelectedIdsChange={setSelectedTagIds}
              onCreate={(name) => createTagMutation.mutateAsync(name)}
              isLoading={isTagsLoading}
              isCreating={createTagMutation.isPending}
              disabled={createCourseMutation.isPending}
            />

            <CreatableMultiSelect
              label="Skills"
              placeholder="Select or create skills"
              searchPlaceholder="Search or enter a skill..."
              createLabel="Create skill"
              items={skills}
              selectedIds={selectedSkillIds}
              onSelectedIdsChange={setSelectedSkillIds}
              onCreate={(name) => createSkillMutation.mutateAsync(name)}
              isLoading={isSkillsLoading}
              isCreating={createSkillMutation.isPending}
              disabled={createCourseMutation.isPending}
            />

            {createCourseMutation.isError ||
            updateCourseTagsMutation.isError ||
            updateCourseSkillsMutation.isError ? (
              <p className="text-sm text-destructive">
                {createCourseMutation.error?.message ??
                  updateCourseTagsMutation.error?.message ??
                  updateCourseSkillsMutation.error?.message ??
                  "Failed to create course."}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={createCourseMutation.isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create course"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

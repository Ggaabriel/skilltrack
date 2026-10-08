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
    const course = await createCourseMutation.mutateAsync(values);

    form.reset();
    createCourseMutation.reset();
    setOpen(false);

    navigate(`${Routes.COURSES}/${course.id}/builder`);
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
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
                      <SelectItem value="QUICK_NOTE">
                        Quick note
                      </SelectItem>

                      <SelectItem value="STEP_BY_STEP">
                        Step by step
                      </SelectItem>

                      <SelectItem value="FREE_FORM">
                        Free form
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {createCourseMutation.isError && (
              <p className="text-sm text-destructive">
                {createCourseMutation.error.message}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={createCourseMutation.isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createCourseMutation.isPending}
              >
                {createCourseMutation.isPending
                  ? "Creating..."
                  : "Create course"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
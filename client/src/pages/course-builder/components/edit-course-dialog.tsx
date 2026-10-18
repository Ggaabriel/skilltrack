import { useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type CourseDetailsInput = {
  title: string;
  description: string;
};

type EditCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | null;
  isSaving: boolean;
  onSave: (input: CourseDetailsInput) => Promise<void>;
};

export function EditCourseDialog({
  open,
  onOpenChange,
  title: currentTitle,
  description: currentDescription,
  isSaving,
  onSave,
}: EditCourseDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription ?? "");
  const hasChanges =
    title.trim() !== currentTitle ||
    description !== (currentDescription ?? "");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSaving) return;

    if (nextOpen) {
      // Refresh the draft when the dialog is opened, without syncing state in an effect.
      setTitle(currentTitle);
      setDescription(currentDescription ?? "");
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle || isSaving) return;

    try {
      await onSave({
        title: normalizedTitle,
        description: description.trim(),
      });
      onOpenChange(false);
    } catch {
      // The caller reports the error; keep the dialog open so the user can retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Edit course details</DialogTitle>
            <DialogDescription>
              Change the course title and description.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="course-title">Title</Label>
            <Input
              id="course-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Course title"
              maxLength={120}
              required
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this course about?"
              maxLength={2000}
              rows={5}
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !hasChanges || isSaving}
            >
              {isSaving ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Save />
              )}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

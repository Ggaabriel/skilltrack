import { LoaderCircle } from "lucide-react";

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
import type { CourseNode } from "@/entities/node";

type DeleteNodeDialogProps = {
  node: CourseNode | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteNodeDialog({
  node,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteNodeDialogProps) {
  return (
    <AlertDialog
      open={node !== null}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{node?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Its children will remain in the course and become root nodes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <LoaderCircle className="animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

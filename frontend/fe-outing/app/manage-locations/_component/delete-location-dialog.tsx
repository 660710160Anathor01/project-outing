"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseIconButton,
} from "@/src/_component/dialog";
import { Button } from "@/src/_component/button";
import type { Location } from "@/src/_lib/api/registration-type";

type DeleteLocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  isDeleting?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
};

export function DeleteLocationDialog({
  open,
  onOpenChange,
  location,
  isDeleting = false,
  errorMessage,
  onConfirm,
}: DeleteLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <DialogTitle className="text-base font-semibold">
            Delete location
          </DialogTitle>
          <DialogCloseIconButton />
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-black">
                {location?.name ?? "this location"}
              </span>
              ? This can&apos;t be undone, and it may affect existing
              registrations tied to it.
            </p>
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-600"
              onClick={onConfirm}
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
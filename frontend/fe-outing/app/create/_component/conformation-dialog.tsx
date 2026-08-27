import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogCloseIconButton,
  } from "@/src/_component/dialog";
import { Button } from "@/src/_component/button";
  
  interface ConformationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handleSubmit: () => void;
    children: React.ReactNode;
  }
  
  export default function ConformationDialog({
    open,
    onOpenChange,
    handleSubmit,
    children,
  }: ConformationDialogProps) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
  
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="flex flex-col gap-2 mb-4">
            <DialogTitle className="text-lg font-bold">
                Confirmation
            </DialogTitle>
  
            <DialogDescription className="text-sm text-gray-500">
              Are you sure you want to complete your registration?
            </DialogDescription>
          </DialogHeader>
  
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
  
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
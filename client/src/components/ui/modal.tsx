import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "lg" }: ModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-white border-b pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="pt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

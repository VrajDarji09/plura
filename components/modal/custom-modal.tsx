import { useModal } from "@/providers/ModalProvider";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
interface CustomModalProps {
  title: string;
  subHeading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  title,
  subHeading,
  children,
  defaultOpen,
}) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent className="md:max-h-[700px] md:h-fit h-screen bg-card overflow-auto">
        <DialogHeader className="py-3 text-left">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{subHeading}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;

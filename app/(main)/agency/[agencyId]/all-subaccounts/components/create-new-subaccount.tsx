"use client";
import { useModal } from "@/providers/ModalProvider";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client";
import React from "react";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import CustomModal from "@/components/modal/custom-modal";
import SubAccountDetails from "@/components/forms/subaccount-details";
import { PlusCircleIcon } from "lucide-react";

type Props = {
  user: User & {
    Agency:
      | (
          | Agency
          | (null & {
              SubAccount: SubAccount[];
              SideBarOptions: AgencySidebarOption[];
            })
        )
      | null;
  };
  id: string;
  className: string;
};

const CreateSubaccountBtn = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;
  if (!agencyDetails) {
    return;
  }
  return (
    <Button
      className={twMerge("w-full flex gap-4", className)}
      onClick={() =>
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subHeading="You can switch bettween"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        )
      }
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  );
};

export default CreateSubaccountBtn;

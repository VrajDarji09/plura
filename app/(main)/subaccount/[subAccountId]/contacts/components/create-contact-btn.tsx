"use client";
import ContactUserForm from "@/components/forms/contact-user-form";
import CustomModal from "@/components/modal/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/ModalProvider";
import React from "react";

type Props = {
  subAccountId: string;
};

const CreateContactBtn = ({ subAccountId }: Props) => {
  const { setOpen } = useModal();
  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Create Or Update Contact information"
        subHeading="Contacts are like customers."
      >
        <ContactUserForm subaccountId={subAccountId} />
      </CustomModal>
    );
  };
  return <Button onClick={handleCreateContact}>Create Contact</Button>;
};

export default CreateContactBtn;

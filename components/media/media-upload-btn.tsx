"use client";

import { useModal } from "@/providers/ModalProvider";
import React from "react";
import { Button } from "../ui/button";
import CustomModal from "../modal/custom-modal";
import UploadMedia from "../forms/upload-media";

type Props = {
  subAccountId: string;
};

const MediaUploadBtn = ({ subAccountId }: Props) => {
  const { isOpen, setClose, setOpen } = useModal();
  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload Media"
            subHeading="Upload a file to your media bucket"
          >
            <UploadMedia subAccountId={subAccountId} />
          </CustomModal>
        );
      }}
    >
      Upload
    </Button>
  );
};

export default MediaUploadBtn;

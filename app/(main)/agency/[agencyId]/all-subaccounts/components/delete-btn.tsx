"use client";
import {
  deleteSubAccount,
  getSubAccountDetails,
  saveActivityLogsNotification,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  subAccountId: string;
};

const DeleteBtn = ({ subAccountId }: Props) => {
  const router = useRouter();
  return (
    <div
      className="text-white"
      onClick={async () => {
        const rsp = await getSubAccountDetails(subAccountId);
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Deleted a subaccount | ${rsp?.name}`,
          subaccountId: subAccountId,
        });
        await deleteSubAccount(subAccountId);
        router.refresh();
      }}
    >
      Delete Sub Account
    </div>
  );
};

export default DeleteBtn;

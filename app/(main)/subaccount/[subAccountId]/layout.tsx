import Sidebar from "@/components/Sidebar/Sidebar";
import Unauthorized from "@/components/global/Unauthorized";
import BlurPage from "@/components/global/blur-page";
import Infobar from "@/components/global/infobar";
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: {
    subAccountId: string;
  };
};

const layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) {
    return <Unauthorized />;
  }
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }

  let notifications: any = [];

  if (!user.privateMetadata.role) {
    return <Unauthorized />;
  } else {
    const allPerm = await getAuthUserDetails();
    const hasPerm = allPerm?.Permissions.find(
      (perm) =>
        perm.access === true && perm.subAccountId === params.subAccountId
    );
    if (!hasPerm) {
      return <Unauthorized />;
    }

    const allNotis = await getNotificationAndUser(agencyId);

    if (
      user.privateMetadata.role === "AGENCY_ADMIN" ||
      user.privateMetadata.role === "AGENCY_OWNER"
    ) {
      notifications = allNotis;
    } else {
      const filterNotis = allNotis?.filter(
        (noti) => noti.subAccountId === params.subAccountId
      );
      if (filterNotis) {
        notifications = filterNotis;
      }
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.subAccountId} type="subaccount" />
      <div className="md:pl-[300px]">
        <Infobar
          notifications={notifications}
          role={user.privateMetadata?.role as Role}
          subAccountId={params.subAccountId}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;

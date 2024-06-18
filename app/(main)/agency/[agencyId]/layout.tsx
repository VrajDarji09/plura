import Sidebar from "@/components/Sidebar/Sidebar";
import Unauthorized from "@/components/global/Unauthorized";
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import BlurPage from "@/components/global/blur-page";
import Infobar from "@/components/global/infobar";
import React from "react";
import { NotificationWithUser } from "@/lib/types";

type props = {
  children: React.ReactNode;
  params: {
    agencyId: string;
  };
};

const layout = async ({ children, params }: props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }
  if (!agencyId) {
    return redirect("/agency");
  }

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  ) {
    return <Unauthorized />;
  }

  let allNoti: NotificationWithUser | [] = [];

  const notification = await getNotificationAndUser(agencyId);
  if (notification) {
    allNoti = notification;
  }
  console.log();

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[300px]">
        <Infobar notifications={allNoti} role={allNoti?.[0]?.User?.role} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;

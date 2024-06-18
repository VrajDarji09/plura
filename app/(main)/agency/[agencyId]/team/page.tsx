import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import React from "react";
import DataTable from "./components/data-table";
import { Plus } from "lucide-react";
import { colums } from "./components/columns";
import SendInvitation from "@/components/forms/send-invitation";

type Props = {
  params: {
    agencyId: string;
  };
};

const page = async ({ params }: Props) => {
  const authUser = await currentUser();
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },
    include: {
      Agency: {
        include: {
          SubAccount: true,
        },
      },
      Permissions: {
        include: {
          SubAccount: true,
        },
      },
    },
  });
  if (!authUser) {
    return null;
  }
  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccount: true,
    },
  });
  if (!agencyDetails) {
    return;
  }
  return (
    <div>
      <DataTable
        actionButtonText={"Add"}
        modalChildren={<SendInvitation agencyId={params.agencyId} />}
        filterValue="name"
        columns={colums}
        data={teamMembers}
      />
    </div>
  );
};

export default page;

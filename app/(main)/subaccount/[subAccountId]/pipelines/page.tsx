import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    subAccountId: string;
  };
};

const page = async ({ params }: Props) => {
  const pipelineExist = await db.pipeline.findFirst({
    where: {
      subAccountId: params.subAccountId,
    },
  });

  if (pipelineExist) {
    return redirect(
      `/subaccount/${params.subAccountId}/pipelines/${pipelineExist.id}`
    );
  }
  try {
    const rsp = await db.pipeline.create({
      data: {
        name: "First Pipeline",
        subAccountId: params.subAccountId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export default page;

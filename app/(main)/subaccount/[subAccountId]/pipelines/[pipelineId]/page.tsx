import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import {
  getLanesWithTicketAndTags,
  getPipelineDetails,
  updateLanesOrder,
  updateTicketOrder,
} from "@/lib/queries";
import { LaneDetail } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react";
import PipelineInfobar from "./components/pipeline-infobar";
import PipelineView from "./components/pipeline-view";
import PipelineSettings from "./components/pipeline-settings";

type Props = {
  params: {
    subAccountId: string;
    pipelineId: string;
  };
};

const page = async ({ params }: Props) => {
  const pipeline = await getPipelineDetails(params.pipelineId);
  if (!pipeline) {
    return redirect(`/subaccount/${params.subAccountId}/pipelines`);
  }

  const pipelines = await db.pipeline.findMany({
    where: {
      subAccountId: params.subAccountId,
    },
  });
  console.log(pipelines);

  const lanes = (await getLanesWithTicketAndTags(
    params.pipelineId
  )) as LaneDetail[];

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfobar
          subAccountId={params.subAccountId}
          pipelineId={params.pipelineId}
          pipelines={pipelines || []}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          pipelineId={params.pipelineId}
          pipelineDetails={pipeline}
          lanes={lanes}
          subAccountId={params.subAccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          subaccountId={params.subAccountId}
          pipelineId={params.pipelineId}
          pipelines={pipelines}
        />
      </TabsContent>
    </Tabs>
  );
};

export default page;

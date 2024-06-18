import MediaComponent from "@/components/media/media-component";
import { getMedia } from "@/lib/queries";
import React from "react";

type Props = {
  params: {
    subAccountId: string;
  };
};

const page = async ({ params }: Props) => {
  const data = await getMedia(params.subAccountId);
  return <MediaComponent data={data} subAccountId={params.subAccountId} />;
};

export default page;

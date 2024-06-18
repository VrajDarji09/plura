import React from "react";

type Props = {
  params: {
    subAccountId: string;
  };
};

const page = ({ params }: Props) => {
  return <div>{params.subAccountId}</div>;
};

export default page;

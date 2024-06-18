"use client";
import SubscriptionFormWrapper from "@/components/forms/subscription-form/subscription-form-wrapper";
import CustomModal from "@/components/modal/custom-modal";
import { PriceList } from "@/lib/types";
import { useModal } from "@/providers/ModalProvider";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  prices: PriceList["data"];
  customerId: string;
  planExists: boolean;
};

const SubscriptionHelper = ({ prices, customerId, planExists }: Props) => {
  const { setOpen } = useModal();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (plan) {
      setOpen(
        <CustomModal
          title="Upgrade Plan!"
          subHeading="Get started today to get access to premium features"
        >
          <SubscriptionFormWrapper
            planExists={planExists}
            customerId={customerId}
          />
        </CustomModal>,
        async () => ({
          plans: {
            defaultPriceId: plan ? plan : "",
            plans: prices,
          },
        })
      );
    }
  }, [plan]);
  return <div>SubscriptionHelper</div>;
};

export default SubscriptionHelper;

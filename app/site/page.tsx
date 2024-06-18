"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, []);
  return (
    <main>
      <section className="h-full w-full pt-36 relative flex items-center justify-center flex-col">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
        <p className="text-center">Run your agency, in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Plura
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-70px]">
          <Image
            src={"/assets/preview.png"}
            alt="banner image"
            height={1200}
            width={1200}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 md:mt-20">
        <h2 className="text-4xl text-center"> Choose what fits you right</h2>
        <p className="text-muted-foreground text-center">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not <br />
          ready to commit you can get started for free.
        </p>
        <div className="flex justify-center gap-4 flex-wrap mt-6 pb-12">
          {pricingCards.map((priceCard) => (
            <Card
              key={priceCard.priceId}
              // Work In Progress : Wire up free product from
              className={cn(
                "w-[300px] flex flex-col justify-between",
                priceCard.title === "Unlimited SaaS" &&
                  "border-2 border-primary"
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    priceCard.title === "Unlimited Saas"
                      ? ""
                      : "text-muted-foreground"
                  )}
                >
                  <p>{priceCard.title}</p>
                </CardTitle>
                <CardDescription>
                  <p>{priceCard.description}</p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">
                  <p>{priceCard.price}</p>
                </span>
                <span className="text-muted-foreground">per month</span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {priceCard.features.map((feature) => (
                    <div key={feature} className="flex gap-2 items-center">
                      <Check className="text-muted-foreground" />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/agency?plan=${priceCard.priceId}`}
                  className={cn(
                    "w-full text-center bg-muted-foreground/10 hover:bg-muted-foreground/20 transition p-2 rounded-md",
                    priceCard.title === "Unlimited Saas" &&
                      "!bg-muted-foreground/30 hover:bg-muted-foreground/20"
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

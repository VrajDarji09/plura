import { UserButton, auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ModeToggle } from "../ui/mode-toggle";

const Links = ["Pricing", "About", "Documentation", "Features"];

const Navigation = () => {
  return (
    <div className="fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-20 dark:bg-[rgba(0,0,0,0.5)] bg-[rgba(255,255,255,0.02)]">
      <aside className="flex items-center gap-2">
        <Image
          src={"./assets/plura-logo.svg"}
          width={40}
          height={40}
          alt="plur logo"
        />
        <span className="text-xl font-bold"> Plura.</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <div className="flex flex-row gap-8 items-center">
          {Links.map((link) => (
            <Link href={"#"} key={link}>
              {link}
            </Link>
          ))}
        </div>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link
          href={"/agency"}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Login
        </Link>
        <UserButton afterSignOutUrl="/" />
        <ModeToggle />
      </aside>
    </div>
  );
};

export default Navigation;

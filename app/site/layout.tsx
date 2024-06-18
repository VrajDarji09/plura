import Navigation from "@/components/site/Navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <main className="h-full">
        <Navigation />
        {children}
      </main>
    </ClerkProvider> 
  );
};

export default layout;

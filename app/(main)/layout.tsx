import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: neobrutalism }}>
      <>{children}</>
    </ClerkProvider>
  );
};

export default layout;

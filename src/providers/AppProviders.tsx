"use client";

import type { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { client, zksyncSepolia } from "@/lib/thirdwebClient";

// Wrap your app with ThirdwebProvider (no props directly)
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}

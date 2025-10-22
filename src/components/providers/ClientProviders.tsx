"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/components/providers/TRPCProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <TRPCProvider>
        {children}
      </TRPCProvider>
    </SessionProvider>
  );
}
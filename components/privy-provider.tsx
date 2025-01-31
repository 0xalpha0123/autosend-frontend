"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, sepolia } from "viem/chains";
import { useTheme } from "next-themes";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVI_APP_ID as string}
      config={{
        appearance: {
          theme: theme === "dark" ? "dark" : "light",
          walletList: ["metamask", "rainbow", "wallet_connect"],
        },
        defaultChain: sepolia,
        supportedChains: [base, sepolia],
      }}
    >
      <SmartWalletsProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <main className="h-full">{children}</main>
          </WagmiProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}

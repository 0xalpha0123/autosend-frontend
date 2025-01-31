import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { base, sepolia } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [base, sepolia],
  transports: {
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});

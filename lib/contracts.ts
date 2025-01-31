import { createPublicClient, http, custom } from "viem";
import { mainnet, sepolia } from "viem/chains"; // Import the appropriate chain
import { readContract } from "viem/actions";
import { EIP1193Provider } from "@privy-io/react-auth";

import autoSendABI from "./abis/autoSendABI.json";
import erc20ABI from "./abis/erc20ABI.json";
import { ADDRESSES, MODE } from "./constants";

export const autoSendReadContract = async (
  provider: EIP1193Provider,
  functionName: string,
  args: Array<any>
) => {
  try {
    const client = createPublicClient({
      transport: custom(provider),
      chain: MODE === "mainnet" ? mainnet : sepolia, // Use appropriate chain
    });

    console.log(client);

    const result = await readContract(client, {
      address: ADDRESSES[MODE].AUTOSEND,
      abi: autoSendABI.abi,
      functionName,
      args,
    });

    console.log("Read result:", result);

    return result; // This returns the actual function result
  } catch (error) {
    console.error("Read failed:", error);
    throw new Error("Failed to fetch data from contract");
  }
};

// export const erc20Contract = async (
//   provider: EIP1193Provider,
//   functionName: string,
//   args: Array<any>
// ) => {
//   const data = encodeFunctionData({
//     abi: erc20ABI.abi,
//     functionName: functionName,
//     args: args,
//   });

//   const transactionRequest = {
//     to: ADDRESSES[MODE].USDC,
//     data: data,
//     value: 100000, // Only necessary for payable methods
//   };

//   const transactionHash = await provider.request({
//     method: "eth_sendTransaction",
//     params: [transactionRequest],
//   });

//   return transactionHash;
// };

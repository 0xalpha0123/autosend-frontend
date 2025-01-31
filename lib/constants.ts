interface Addresses {
  testnet: {
    chainID: number;
    AUTOSEND: `0x${string}`;
    USDC: `0x${string}`;
    USDC_DECIMAL: number;
    ETHSCAN_URL: string;
  };
  mainnet: {
    chainID: number;
    AUTOSEND: `0x${string}`;
    USDC: `0x${string}`;
    USDC_DECIMAL: number;
    ETHSCAN_URL: string;
  };
}

export const Status = ["Scheduled", "Updated", "Canceled", "Funded", "Expired"];

export const ADDRESSES: Addresses = {
  testnet: {
    chainID: 11155111,
    AUTOSEND: "0xc40482853BB44DE1F4D947306Ba95E4eC92c49bB",
    USDC: "0x2D2235E1cA8D5F7E8702893BC10f41f32C1B0bAa",
    USDC_DECIMAL: 18,
    ETHSCAN_URL: "https://sepolia.etherscan.io/",
  },
  mainnet: {
    chainID: 8453,
    AUTOSEND: "0x2Db90dc8E1eaf2EFE45963120A369004d870529E",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDC_DECIMAL: 18,
    ETHSCAN_URL: "https://basescan.org/",
  },
};

export const MODE: "testnet" | "mainnet" = "testnet"; // "testnet" or "mainnet"

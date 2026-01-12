// src/lib/thirdwebClient.ts
import { createThirdwebClient, getContract, defineChain } from "thirdweb";
import deployed from "../../public/deployed-address.json";

const NETWORK = process.env.NETWORK || "sepolia"; // "sepolia" or "mainnet"

// ----------------- Chains -----------------
export const ethSepolia = defineChain({
  id: 11155111,
  name: "Ethereum Sepolia Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Etherscan", url: "https://sepolia.etherscan.io" }],
});

export const ethMainnet = defineChain({
  id: 1,
  name: "Ethereum Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Etherscan", url: "https://etherscan.io" }],
});

export const chain = NETWORK === "mainnet" ? ethMainnet : ethSepolia;

// ----------------- Client -----------------
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  chain,
});

// ----------------- Contract -----------------
export const contract = getContract({
  client,
  chain,
  address: deployed.proxy, // same proxy for Mainnet / Sepolia (deploy new proxy on Mainnet)
});

export { client as thirdwebClient };

import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import abiJson from "./SikhLiteratureUpgradeable.json";

// ---------------------------------------------------------
// NETWORK
// ---------------------------------------------------------
const SEPOLIA_RPC = process.env.NEXT_PUBLIC_INFURA_RPC;

// ---------------------------------------------------------
// Load Proxy Address
// ---------------------------------------------------------
async function getContractAddress() {
  const res = await fetch("/deployed-address.json");
  const json = await res.json();
  return json.proxy;
}

// ---------------------------------------------------------
// Get Contract Instance
// ---------------------------------------------------------
export async function getContract(requireWallet = false) {
  const CONTRACT_ADDRESS = await getContractAddress();
  const abi = Array.isArray(abiJson) ? abiJson : abiJson.abi;

  // -----------------------------
  // READ-ONLY (PUBLIC, NO WALLET)
  // -----------------------------
  if (!requireWallet) {
    if (!SEPOLIA_RPC)
      throw new Error("Public RPC not configured");

    const provider = new JsonRpcProvider(SEPOLIA_RPC);
    return new Contract(CONTRACT_ADDRESS, abi, provider);
  }

  // -----------------------------
  // WRITE (WALLET REQUIRED)
  // -----------------------------
  if (!window.ethereum)
    throw new Error("Wallet required");

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new Contract(CONTRACT_ADDRESS, abi, signer);
}

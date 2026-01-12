import { JsonRpcProvider, Contract } from "ethers"
import SikhLiteratureABI from "./SikhLiteratureABI.json"
import deployed from "../../../shc-contract/scripts/deployed-address.json"

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://cloudflare-eth.com"

const provider = new JsonRpcProvider(RPC_URL)

export const sikhLiteratureContract = new Contract(
  deployed.proxy,
  SikhLiteratureABI,
  provider
)

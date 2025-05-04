import { createThirdwebClient } from "thirdweb";
import { PHAROS_RPC_URL, CHAIN_ID } from "../config/constants";

// Get client ID from environment
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id";

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});

// Pharos chain info for reference (will be used in contract hooks)
export const pharosChainInfo = {
  chainId: CHAIN_ID,
  rpc: PHAROS_RPC_URL,
};

export const PHAROS_RPC_URL = "https://pharos-devnet.ankr.com/rpc";
export const CHAIN_ID = 50002;

// Contract addresses
export const IDENTITY_REGISTRY_ADDRESS = "0xE094aeA4FC6Af064d482448f8457Fe310C1C9F67";
export const PROPERTY_TOKEN_ADDRESS = "0x4a00f5279Bc779b74f5D4c0edd385fAD0b7873fd";
export const PROPERTY_MARKETPLACE_ADDRESS = "0xD81A82dad1814F406279330afaCaBDFbff86985b";

// Chain configuration
export const PHAROS_CHAIN_CONFIG = {
  chainId: CHAIN_ID,
  name: "Pharos Devnet",
  currency: {
    name: "Pharos Token",
    symbol: "PHAR",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [PHAROS_RPC_URL] },
    public: { http: [PHAROS_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "PharosExplorer",
      url: "https://pharos-explorer.blockwiz.ph",
    },
  },
  testnet: true,
}; 
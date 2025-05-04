// SPDX-License-Identifier: MIT
require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const PHAROS_TESTNET_RPC_URL = process.env.PHAROS_TESTNET_RPC_URL || "https://rpc-testnet.pharosnetwork.xyz";
const PHAROS_MAINNET_RPC_URL = process.env.PHAROS_MAINNET_RPC_URL || "https://rpc.pharosnetwork.xyz";
const PHAROS_DEVNET_RPC_URL = process.env.PHAROS_DEVNET_RPC_URL || "https://devnet.dplabs-internal.com";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 50002,
    },
    pharosTestnet: {
      url: PHAROS_DEVNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1321,
      gasPrice: 8000000000,
    },
    pharosMainnet: {
      url: PHAROS_MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1320,
      gasPrice: 8000000000,
    },
    pharosDevnet: {
      url: PHAROS_DEVNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 50002,
      gasPrice: 8000000000,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "pharosDevnet",
        chainId: 50002,
        urls: {
          apiURL: "https://pharosscan.xyz/api",
          browserURL: "https://pharosscan.xyz/"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};

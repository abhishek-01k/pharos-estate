# PharosEstate Smart Contracts

This directory contains the smart contracts for the PharosEstate platform, a decentralized platform for commercial real estate tokenization built on the Pharos Network.

## Features

- ERC-3643 compliant property tokens for regulatory compliance
- Property marketplace for trading tokenized real estate
- Identity registry for KYC/AML compliance
- Automated rental income distribution

## Prerequisites

- Node.js v16+
- Hardhat
- MetaMask or compatible wallet

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PRIVATE_KEY=your_private_key
   PHAROS_DEVNET_RPC_URL=https://devnet.dplabs-internal.com
   ```

## Deployment

### Deploy to Pharos Devnet

```
npx hardhat run scripts/deploy.js --network pharosDevnet
```

### Pharos Devnet Network Details

- **RPC Public Endpoint**: https://devnet.dplabs-internal.com
- **WSS Public Endpoint**: wss://devnet.dplabs-internal.com
- **Explorer**: https://pharosscan.xyz/
- **ChainID**: 50002
- **Environment**: Devnet
- **Ratelimit**: 500 times/5m
- **Max Pending TXs (Addr)**: 64

## Testing

```
npx hardhat test
```

## Contract Verification

After deployment, verify your contracts on Pharos Explorer:

```
npx hardhat verify --network pharosDevnet YOUR_CONTRACT_ADDRESS [constructor arguments...]
```

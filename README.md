# PharosEstate - Commercial Real Estate Tokenization Platform

PharosEstate is a decentralized platform built on the Pharos Network that enables fractional ownership of commercial real estate properties through tokenization. The platform allows investors to purchase portions of high-value commercial properties, earn rental income, and trade their ownership stakes in a liquid marketplace.

## 🌟 Key Features

- Fractional Ownership: Purchase tokens representing partial ownership of premium commercial properties
- Dynamic Tokenization: Property tokens that adapt based on real-time performance metrics
- Automated Rental Distribution: Smart contracts distribute rental income to token holders proportionally
- Secondary Market: Trade property tokens with high liquidity on our built-in marketplace
- KYC/AML Compliance: Regulatory-compliant platform with integrated identity verification
- Cross-Border Investments: Invest in global real estate markets without traditional geographical barriers
- Property Analytics: Real-time data and analytics on property performance and investment returns
- Portfolio Management: Tools to track and manage your diversified real estate portfolio


## Contract Addresses (Pharos Devnet)

| Contract           | Address                                    |
|--------------------|--------------------------------------------|
| IdentityRegistry   | 0xE094aeA4FC6Af064d482448f8457Fe310C1C9F67 |
| PropertyToken      | 0x4a00f5279Bc779b74f5D4c0edd385fAD0b7873fd |
| PropertyMarketplace| 0xD81A82dad1814F406279330afaCaBDFbff86985b |

## 🏗️ Architecture

RealTokens leverages Pharos Network's high-performance infrastructure:

- Frontend: Next.js application with TypeScript and Tailwind CSS
- Smart Contracts: Solidity contracts deployed on Pharos Network
- Tokenization: ERC-3643 compliant tokens for regulatory compliance
- Identity & Compliance: On-chain identity verification and compliance checks
- Middleware: API layer connecting real-world property data to on-chain assets
- Oracle Integration: Real-world data feeds for property values and rental income

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- Bun or npm
- Metamask or compatible wallet with Pharos Network configured

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/kamalbuilds/realtokens.git
   cd realtokens
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install contract dependencies:
   ```
   cd ../contracts
   npm install
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env` in both directories
   - Set up necessary API keys and contract addresses

5. Start the development server:
   ```
   cd ../frontend
   npm run dev
   ```

## 💻 Development

### Smart Contracts

Deploy contracts to Pharos Testnet:

```
cd contracts
npx hardhat run scripts/deploy.js --network pharosTestnet
```

### Testing

Run contract tests:

```
cd contracts
npx hardhat test
```

## 📊 Business Model

- Platform Fees: 1-2% fee on property tokenization
- Transaction Fees: 0.5% fee on secondary market trades
- Management Fees: 0.25% annual fee on assets under management
- Premium Services: Additional fees for advanced analytics and portfolio tools

## 🔗 How It Leverages Pharos Network

- High Performance: Utilizes Pharos's parallel execution for high-volume token trading
- Interoperability: Connects to traditional finance systems via Pharos's data exchange protocol
- Scalability: Leverages Special Processing Networks (SPNs) for specialized real estate data processing
- Security: Implements Pharos's native restaking for enhanced security guarantees

## 📝 License

MIT

// deploy.js - Script to deploy the PharosEstate platform smart contracts
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying PharosEstate platform contracts...");
  console.log(`Network: ${network.name}, ChainId: ${network.config.chainId}`);

  // Get the contract factories
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
  
  // Deploy the PropertyToken implementation as upgradeable
  console.log("Deploying PropertyToken implementation...");
  const propertyTokenImpl = await upgrades.deployProxy(PropertyToken, [
    "Pharos Commercial Property", // name
    "PCP", // symbol
    "123 Main Street, New York, NY", // propertyAddress
    ethers.utils.parseEther("1000000"), // propertyValue (1 million)
    "ipfs://QmURkM5z9TQCy4tR9NB9mGSQ8198ZBP352rwQodyU8zLuu", // propertyDocumentURI (example IPFS hash)
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // complianceManager (example address)
  ], { initializer: 'initialize' });
  
  await propertyTokenImpl.deployed();
  console.log("PropertyToken deployed to:", propertyTokenImpl.address);
  
  // Deploy the PropertyMarketplace as upgradeable
  console.log("Deploying PropertyMarketplace...");
  const propertyMarketplace = await upgrades.deployProxy(PropertyMarketplace, [
    50, // listingFee (0.5%)
    100, // transactionFee (1%)
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // feeRecipient (example address)
  ], { initializer: 'initialize' });
  
  await propertyMarketplace.deployed();
  console.log("PropertyMarketplace deployed to:", propertyMarketplace.address);
  
  // Approve the property token in the marketplace
  console.log("Approving property token in marketplace...");
  const approveTx = await propertyMarketplace.approvePropertyToken(propertyTokenImpl.address);
  await approveTx.wait();
  console.log("Property token approved in marketplace");
  
  // Display deployment information
  console.log("Deployment complete!");
  console.log(`Network: ${network.name}, ChainId: ${network.config.chainId}`);
  console.log("PropertyToken:", propertyTokenImpl.address);
  console.log("PropertyMarketplace:", propertyMarketplace.address);
  console.log(`Verify contracts on Pharos Explorer: https://pharosscan.xyz/address/${propertyTokenImpl.address}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
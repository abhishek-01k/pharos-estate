// interact.js - Script to interact with deployed PharosEstate contracts
const hre = require("hardhat");
const { ethers } = require("hardhat");

// Deployed contract addresses
const IDENTITY_REGISTRY_ADDRESS = "0xE094aeA4FC6Af064d482448f8457Fe310C1C9F67";
const PROPERTY_TOKEN_ADDRESS = "0x4a00f5279Bc779b74f5D4c0edd385fAD0b7873fd";
const PROPERTY_MARKETPLACE_ADDRESS = "0xD81A82dad1814F406279330afaCaBDFbff86985b";

async function main() {
  console.log("Interacting with PharosEstate contracts...");
  console.log(`Network: ${network.name}, ChainId: ${network.config.chainId}`);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);

  try {
    // Connect to deployed contracts
    console.log("\nConnecting to deployed contracts...");
    
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const identityRegistry = await IdentityRegistry.attach(IDENTITY_REGISTRY_ADDRESS);
    
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.attach(PROPERTY_TOKEN_ADDRESS);
    
    const PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
    const propertyMarketplace = await PropertyMarketplace.attach(PROPERTY_MARKETPLACE_ADDRESS);
    
    console.log("Successfully connected to contracts");
    
    // Get PropertyToken details
    console.log("\nRetrieving PropertyToken details...");
    const name = await propertyToken.name();
    const symbol = await propertyToken.symbol();
    const totalSupply = await propertyToken.totalSupply();
    const propertyAddress = await propertyToken.propertyAddress();
    const propertyValue = await propertyToken.propertyValue();
    const propertyDocumentURI = await propertyToken.propertyDocumentURI();
    const occupancyRate = await propertyToken.occupancyRate();
    const propertyYield = await propertyToken.propertyYield();
    
    console.log("PropertyToken Details:");
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} tokens`);
    console.log(`Property Address: ${propertyAddress}`);
    console.log(`Property Value: ${ethers.formatEther(propertyValue)} ETH`);
    console.log(`Property Document URI: ${propertyDocumentURI}`);
    console.log(`Occupancy Rate: ${Number(occupancyRate) / 100}%`);
    console.log(`Property Yield: ${Number(propertyYield) / 100}%`);
    
    // Get PropertyMarketplace details
    console.log("\nRetrieving PropertyMarketplace details...");
    const listingFee = await propertyMarketplace.listingFee();
    const transactionFee = await propertyMarketplace.transactionFee();
    const feeRecipient = await propertyMarketplace.feeRecipient();
    const isTokenApproved = await propertyMarketplace.approvedPropertyTokens(PROPERTY_TOKEN_ADDRESS);
    
    console.log("PropertyMarketplace Details:");
    console.log(`Listing Fee: ${Number(listingFee) / 100}%`);
    console.log(`Transaction Fee: ${Number(transactionFee) / 100}%`);
    console.log(`Fee Recipient: ${feeRecipient}`);
    console.log(`Is PropertyToken Approved: ${isTokenApproved}`);
    
    console.log("\nInteraction complete!");
  } catch (error) {
    console.error("Interaction failed:", error);
    throw error;
  }
}

// Execute the interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
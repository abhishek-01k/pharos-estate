// deploy-remaining.js - Script to deploy the remaining PharosEstate contracts
const hre = require("hardhat");
const { ethers } = require("hardhat");

// Pre-deployed IdentityRegistry address
const IDENTITY_REGISTRY_ADDRESS = "0xE094aeA4FC6Af064d482448f8457Fe310C1C9F67";

async function main() {
  console.log("Deploying remaining PharosEstate contracts...");
  console.log(`Network: ${network.name}, ChainId: ${network.config.chainId}`);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  try {
    // Step 1: Deploy PropertyToken without initialization
    console.log("\nStep 1: Deploying PropertyToken...");
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy();
    await propertyToken.waitForDeployment();
    const propertyTokenAddress = await propertyToken.getAddress();
    console.log("PropertyToken deployed to:", propertyTokenAddress);
    
    // Step 2: Deploy PropertyMarketplace without initialization
    console.log("\nStep 2: Deploying PropertyMarketplace...");
    const PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
    const propertyMarketplace = await PropertyMarketplace.deploy();
    await propertyMarketplace.waitForDeployment();
    const propertyMarketplaceAddress = await propertyMarketplace.getAddress();
    console.log("PropertyMarketplace deployed to:", propertyMarketplaceAddress);
    
    // Step 3: Initialize PropertyToken with separate transaction
    console.log("\nStep 3: Initializing PropertyToken...");
    try {
      // Parameters for initialization
      const name = "Pharos Property Token";
      const symbol = "PPT";
      const propertyAddress = "123 Main St, New York, NY";
      const propertyValue = ethers.parseEther("1000000"); // 1M tokens
      const propertyDocumentURI = "ipfs://QmTest";
      
      // Using lower-level transaction for better debugging
      const initData = PropertyToken.interface.encodeFunctionData("initialize", [
        name,
        symbol,
        propertyAddress,
        propertyValue,
        propertyDocumentURI,
        deployer.address // complianceManager
      ]);
      
      console.log("Encoded initialization data:", initData);
      
      // Send the transaction with explicit gas limit
      const tx = await deployer.sendTransaction({
        to: propertyTokenAddress,
        data: initData,
        gasLimit: 5000000 // Higher gas limit
      });
      
      console.log("Initialization transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("PropertyToken initialized. Receipt:", {
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });
    } catch (error) {
      console.error("Failed to initialize PropertyToken:", error.message);
      // Continue with the script despite the error
    }
    
    // Step 4: Initialize PropertyMarketplace
    console.log("\nStep 4: Initializing PropertyMarketplace...");
    try {
      // Parameters for initialization
      const listingFee = 50; // 0.5%
      const transactionFee = 100; // 1%
      
      // Using lower-level transaction for better debugging
      const initData = PropertyMarketplace.interface.encodeFunctionData("initialize", [
        listingFee,
        transactionFee,
        deployer.address // feeRecipient
      ]);
      
      // Send the transaction with explicit gas limit
      const tx = await deployer.sendTransaction({
        to: propertyMarketplaceAddress,
        data: initData,
        gasLimit: 5000000 // Higher gas limit
      });
      
      console.log("Initialization transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("PropertyMarketplace initialized. Receipt:", {
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });
    } catch (error) {
      console.error("Failed to initialize PropertyMarketplace:", error.message);
      // Continue with the script despite the error
    }
    
    // Step 5: Connect the contracts if both initializations succeeded
    console.log("\nStep 5: Connecting PropertyToken to PropertyMarketplace...");
    try {
      const approveTx = await propertyMarketplace.approvePropertyToken(propertyTokenAddress, {
        gasLimit: 2000000
      });
      
      console.log("Approval transaction sent:", approveTx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await approveTx.wait();
      console.log("PropertyToken approved in marketplace. Receipt:", {
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });
    } catch (error) {
      console.error("Failed to connect contracts:", error.message);
    }
    
    // Display deployment information
    console.log("\nDeployment summary:");
    console.log(`Network: ${network.name}, ChainId: ${network.config.chainId}`);
    console.log("IdentityRegistry:", IDENTITY_REGISTRY_ADDRESS);
    console.log("PropertyToken:", propertyTokenAddress);
    console.log("PropertyMarketplace:", propertyMarketplaceAddress);
    
    console.log("\nTo verify contracts on Pharos Explorer, run:");
    console.log(`npx hardhat verify --network pharosDevnet ${propertyTokenAddress}`);
    console.log(`npx hardhat verify --network pharosDevnet ${propertyMarketplaceAddress}`);
    
    // Update this information in the README.md
    console.log("\nAdd these contract addresses to your README.md:");
    console.log(`IdentityRegistry: ${IDENTITY_REGISTRY_ADDRESS}`);
    console.log(`PropertyToken: ${propertyTokenAddress}`);
    console.log(`PropertyMarketplace: ${propertyMarketplaceAddress}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
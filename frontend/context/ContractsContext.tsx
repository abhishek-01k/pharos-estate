import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  useActiveAccount, 
  useReadContract, 
  useSendTransaction 
} from 'thirdweb/react';
import { 
  client, 
  pharosChainInfo 
} from '../app/client';
import { getContract } from 'thirdweb';
import { prepareContractCall } from 'thirdweb';
import { 
  IDENTITY_REGISTRY_ADDRESS, 
  PROPERTY_TOKEN_ADDRESS, 
  PROPERTY_MARKETPLACE_ADDRESS,
  PHAROS_RPC_URL
} from '../config/constants';
import { 
  IdentityRegistryABI, 
  PropertyTokenABI, 
  PropertyMarketplaceABI 
} from '../config/abis';

interface ContractsContextType {
  // Connection state
  isConnected: boolean;
  userAddress: string | undefined;
  // Property token
  propertyDetails: {
    name: string;
    symbol: string;
    totalSupply: string;
    propertyAddress: string;
    propertyValue: string;
    occupancyRate: number;
    propertyYield: number;
    documentURI: string;
  };
  userBalance: string;
  // Marketplace
  listingFee: number;
  transactionFee: number;
  listings: any[];
  // Functions
  listProperty: (tokenId: number, price: string) => Promise<void>;
  buyProperty: (tokenId: number, price: string) => Promise<void>;
  approveMarketplace: (amount: string) => Promise<void>;
  isKYCVerified: (address: string) => Promise<boolean>;
  // Loading states
  isLoading: boolean;
  isTokenDetailsLoading: boolean;
  isMarketplaceDataLoading: boolean;
}

const ContractsContext = createContext<ContractsContextType | undefined>(undefined);

// Create contract instances
const propertyTokenContract = getContract({
  client,
  address: PROPERTY_TOKEN_ADDRESS,
  chainId: pharosChainInfo.chainId,
  abi: PropertyTokenABI,
});

const propertyMarketplaceContract = getContract({
  client,
  address: PROPERTY_MARKETPLACE_ADDRESS,
  chainId: pharosChainInfo.chainId,
  abi: PropertyMarketplaceABI,
});

const identityRegistryContract = getContract({
  client,
  address: IDENTITY_REGISTRY_ADDRESS,
  chainId: pharosChainInfo.chainId,
  abi: IdentityRegistryABI,
});

export function ContractsProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount();
  const userAddress = account?.address;
  const isConnected = !!userAddress;
  
  // State for contract data
  const [propertyDetails, setPropertyDetails] = useState({
    name: '',
    symbol: '',
    totalSupply: '0',
    propertyAddress: '',
    propertyValue: '0',
    occupancyRate: 0,
    propertyYield: 0,
    documentURI: ''
  });
  const [userBalance, setUserBalance] = useState('0');
  const [listingFee, setListingFee] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenDetailsLoading, setIsTokenDetailsLoading] = useState(true);
  const [isMarketplaceDataLoading, setIsMarketplaceDataLoading] = useState(true);

  // Transaction hook
  const { mutate: sendTransaction } = useSendTransaction();

  // Read contract data
  const { data: tokenName } = useReadContract({
    contract: propertyTokenContract,
    method: "function name() view returns (string)",
    params: []
  });

  const { data: tokenSymbol } = useReadContract({
    contract: propertyTokenContract,
    method: "function symbol() view returns (string)",
    params: []
  });

  const { data: totalSupply } = useReadContract({
    contract: propertyTokenContract,
    method: "function totalSupply() view returns (uint256)",
    params: []
  });

  const { data: propertyAddressData } = useReadContract({
    contract: propertyTokenContract,
    method: "function propertyAddress() view returns (string)",
    params: []
  });

  const { data: propertyValueData } = useReadContract({
    contract: propertyTokenContract,
    method: "function propertyValue() view returns (uint256)",
    params: []
  });

  const { data: propertyDocumentURI } = useReadContract({
    contract: propertyTokenContract,
    method: "function propertyDocumentURI() view returns (string)",
    params: []
  });

  const { data: occupancyRateData } = useReadContract({
    contract: propertyTokenContract,
    method: "function occupancyRate() view returns (uint256)",
    params: []
  });

  const { data: propertyYieldData } = useReadContract({
    contract: propertyTokenContract,
    method: "function propertyYield() view returns (uint256)",
    params: []
  });

  const { data: balanceData } = useReadContract({
    contract: propertyTokenContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress
  });

  const { data: listingFeeData } = useReadContract({
    contract: propertyMarketplaceContract,
    method: "function listingFee() view returns (uint256)",
    params: []
  });

  const { data: transactionFeeData } = useReadContract({
    contract: propertyMarketplaceContract,
    method: "function transactionFee() view returns (uint256)",
    params: []
  });

  const { data: listingsData } = useReadContract({
    contract: propertyMarketplaceContract,
    method: "function getAllListings() view returns (tuple(address seller, address tokenAddress, uint256 tokenId, uint256 price, bool sold)[])",
    params: []
  });

  // Update state when contract data changes
  useEffect(() => {
    if (
      tokenName && 
      tokenSymbol && 
      totalSupply && 
      propertyAddressData && 
      propertyValueData &&
      occupancyRateData &&
      propertyYieldData &&
      propertyDocumentURI
    ) {
      setPropertyDetails({
        name: tokenName as string,
        symbol: tokenSymbol as string,
        totalSupply: ethers.utils.formatEther(totalSupply as any),
        propertyAddress: propertyAddressData as string,
        propertyValue: ethers.utils.formatEther(propertyValueData as any),
        occupancyRate: Number(occupancyRateData) / 100,
        propertyYield: Number(propertyYieldData) / 100,
        documentURI: propertyDocumentURI as string
      });
      setIsTokenDetailsLoading(false);
    }

    if (balanceData && userAddress) {
      setUserBalance(ethers.utils.formatEther(balanceData as any));
    }

    if (listingFeeData && transactionFeeData) {
      setListingFee(Number(listingFeeData) / 100);
      setTransactionFee(Number(transactionFeeData) / 100);
      setIsMarketplaceDataLoading(false);
    }

    if (listingsData) {
      setListings(listingsData as any[]);
    }

    if (!isTokenDetailsLoading && !isMarketplaceDataLoading) {
      setIsLoading(false);
    }
  }, [
    tokenName, 
    tokenSymbol, 
    totalSupply, 
    propertyAddressData, 
    propertyValueData, 
    occupancyRateData,
    propertyYieldData,
    propertyDocumentURI,
    balanceData, 
    userAddress,
    listingFeeData,
    transactionFeeData,
    listingsData,
    isTokenDetailsLoading,
    isMarketplaceDataLoading
  ]);

  // Function to approve marketplace to spend tokens
  const approveMarketplace = async (amount: string) => {
    try {
      const transaction = prepareContractCall({
        contract: propertyTokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [PROPERTY_MARKETPLACE_ADDRESS, ethers.utils.parseEther(amount)]
      });
      sendTransaction(transaction);
    } catch (error) {
      console.error("Failed to approve marketplace:", error);
      throw error;
    }
  };

  // Function to list property
  const listProperty = async (tokenId: number, price: string) => {
    try {
      const transaction = prepareContractCall({
        contract: propertyMarketplaceContract,
        method: "function listProperty(address tokenAddress, uint256 tokenId, uint256 price)",
        params: [PROPERTY_TOKEN_ADDRESS, tokenId, ethers.utils.parseEther(price)]
      });
      sendTransaction(transaction);
    } catch (error) {
      console.error("Failed to list property:", error);
      throw error;
    }
  };

  // Function to buy property
  const buyProperty = async (tokenId: number, price: string) => {
    try {
      const transaction = prepareContractCall({
        contract: propertyMarketplaceContract,
        method: "function buyProperty(address tokenAddress, uint256 tokenId)",
        params: [PROPERTY_TOKEN_ADDRESS, tokenId],
        overrides: {
          value: ethers.utils.parseEther(price)
        }
      });
      sendTransaction(transaction);
    } catch (error) {
      console.error("Failed to buy property:", error);
      throw error;
    }
  };

  // Function to check if address is KYC verified
  const isKYCVerified = async (address: string): Promise<boolean> => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(PHAROS_RPC_URL);
      const contract = new ethers.Contract(IDENTITY_REGISTRY_ADDRESS, IdentityRegistryABI, provider);
      return await contract.isKYCVerified(address);
    } catch (error) {
      console.error("Failed to check KYC status:", error);
      return false;
    }
  };

  const value = {
    isConnected,
    userAddress,
    propertyDetails,
    userBalance,
    listingFee,
    transactionFee,
    listings,
    listProperty,
    buyProperty,
    approveMarketplace,
    isKYCVerified,
    isLoading,
    isTokenDetailsLoading,
    isMarketplaceDataLoading
  };

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}

export function useContracts() {
  const context = useContext(ContractsContext);
  if (context === undefined) {
    throw new Error("useContracts must be used within a ContractsProvider");
  }
  return context;
} 
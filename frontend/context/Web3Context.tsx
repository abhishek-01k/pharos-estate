"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Add TypeScript definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: any) => void;
      removeListener: (event: string, listener: any) => void;
    };
  }
}

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  networkName: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  networkName: null,
  isConnected: false,
  isCorrectNetwork: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

interface Web3ProviderProps {
  children: ReactNode;
}

// Pharos Devnet network details
const PHAROS_DEVNET_CHAIN_ID = 50002;
const PHAROS_DEVNET_DETAILS = {
  chainId: `0x${PHAROS_DEVNET_CHAIN_ID.toString(16)}`,
  chainName: 'Pharos Devnet',
  nativeCurrency: {
    name: 'Pharos',
    symbol: 'PHAR',
    decimals: 18,
  },
  rpcUrls: ['https://devnet.dplabs-internal.com'],
  blockExplorerUrls: ['https://pharosscan.xyz/'],
};

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);

  // Initialize from local storage
  useEffect(() => {
    const connectOnLoad = async () => {
      if (typeof window !== 'undefined' && window.localStorage.getItem('isWalletConnected') === 'true') {
        await connectWallet();
      }
    };
    
    connectOnLoad();
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (_chainId: string) => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // Update connection status
  useEffect(() => {
    setIsConnected(!!account && !!provider);
    setIsCorrectNetwork(chainId === PHAROS_DEVNET_CHAIN_ID);
  }, [account, provider, chainId]);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get provider and signer
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethersSigner = ethersProvider.getSigner();
        
        // Get chain ID and network
        const network = await ethersProvider.getNetwork();
        
        // Update state
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setAccount(accounts[0]);
        setChainId(network.chainId);
        setNetworkName(network.name);
        
        // Save connection state
        localStorage.setItem('isWalletConnected', 'true');
        
        // Check if on correct network, switch if not
        if (network.chainId !== PHAROS_DEVNET_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: PHAROS_DEVNET_DETAILS.chainId }],
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [PHAROS_DEVNET_DETAILS],
                });
              } catch (addError) {
                console.error('Failed to add network', addError);
              }
            } else {
              console.error('Failed to switch network', switchError);
            }
          }
        }
      } catch (error) {
        console.error('Error connecting to wallet', error);
      }
    } else {
      alert('Please install MetaMask or another compatible Ethereum wallet');
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setNetworkName(null);
    localStorage.removeItem('isWalletConnected');
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        networkName,
        isConnected,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

export default Web3Context; 
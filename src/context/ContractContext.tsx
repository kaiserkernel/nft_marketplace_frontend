import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, BrowserProvider, formatEther } from "ethers";
import {
  type Provider,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";

import { notify } from "../components/common/Notify";
import { ContractFactoryABI } from "../contracts/index"; // Make sure the path is correct

// Environment variable for contract address (default to an empty string if not provided)
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ?? "";
const WS_RPC_URL = process.env.REACT_APP_TESTNET_WS_RPC_URL ?? "";

// Define types for context to ensure type safety
interface ContractContextType {
  contract: ethers.Contract | null; // Contract instance or null if not yet initialized
  wsContract: ethers.Contract | null; // Provider instance or null if not yet initialized
  walletAddress: string | null;
  walletBalance: string  | null;
  walletAvatar: string | null;
  isWalletConnected: boolean;
  setContract: React.Dispatch<React.SetStateAction<ethers.Contract | null>>;
  setWsContract: React.Dispatch<React.SetStateAction<ethers.Contract | null>>;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
  setWalletBalance: React.Dispatch<React.SetStateAction<string | null>>;
  setWalletAvatar: React.Dispatch<React.SetStateAction<string | null>>;
  setIsWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
  signer: ethers.JsonRpcSigner | null,
  wsProvider: ethers.WebSocketProvider | null
}

// Create context with default values
const ContractContext = createContext<ContractContextType>({
  contract: null,
  wsContract: null,
  walletAddress: null,
  walletBalance: null,
  walletAvatar: null,
  isWalletConnected: false,
  setContract: () => {},
  setWsContract: () => {},
  setWalletAddress: () => {},
  setWalletBalance: () => {},
  setWalletAvatar: () => {},
  setIsWalletConnected: () => {},
  signer: null,
  wsProvider: null
});

// Context Provider Component that manages the contract and provider state
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [wsContract, setWsContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletAvatar, setWalletAvatar] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [wsProvider, setWsProvider] = useState<ethers.WebSocketProvider | null>(null);

  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  const getAllUserInfo = async (provider: BrowserProvider, address: string) => {
    try {
      // Fetch wallet balance
      const balance = await provider.getBalance(address);
      setWalletBalance(formatEther(balance)); // Convert balance from Wei to ETH
  
      // Attempt to fetch the wallet avatar (if supported)
        if (provider.getAvatar) {
          const avatar = await provider.getAvatar(address);
          setWalletAvatar(avatar);
        } else {
          console.log("Avatar fetching is not supported by this provider.");
          setWalletAvatar(null);
        }
    } catch (error) {
      console.log("Error fetching wallet info:", error);
    }
  };

  useEffect(() => {   
    const _initContract = async (_address: string) => {
      try {
        // Convert AppKit's provider to a BrowserProvider (Ethers v6 requirement)
        const browserProvider = new BrowserProvider(walletProvider);
        const _signer = await browserProvider.getSigner(); // Get signer for transactions
        setSigner(_signer);
  
        // Fetch wallet balance and avatar
        await getAllUserInfo(browserProvider, _address);
  
        // Initialize the contract with the signer and ABI, then set it in state
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ContractFactoryABI, _signer);
        setContract(contractInstance);
  
        // Set up WebSocket provider to listen for contract events
        const _wsProvider = new ethers.WebSocketProvider(WS_RPC_URL);
        setWsProvider(_wsProvider);
        const wsContractInstance = new ethers.Contract(CONTRACT_ADDRESS, ContractFactoryABI, _wsProvider);
        setWsContract(wsContractInstance);
      }
      catch (error) {
        notify("Error initializing contract", "error");
        console.log(error);
      }
    }

    if (isConnected && address) {
      _initContract(address);
      setIsWalletConnected(true);
      setWalletAddress(address);
    } else {
      // initialize state
      setContract(null);
      setWsContract(null);
      setWalletAddress(null);
      setWalletAvatar(null);
      setWalletBalance(null);
      setIsWalletConnected(false);

      // navigate home page
      // navigator("/");
    }
  }, [isConnected, address, walletProvider])

  return (
    <ContractContext.Provider value={{ contract, wsContract, walletAddress, walletBalance, walletAvatar, isWalletConnected, setContract, setWsContract, setWalletAddress, setWalletBalance, setWalletAvatar, setIsWalletConnected, signer, wsProvider }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook for using contract
export const useContract = () => useContext(ContractContext);

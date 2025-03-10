import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { notify } from "../components/common/Notify";
import { ContractABI } from "../contracts/index"; // Make sure the path is correct

// Environment variable for contract address (default to an empty string if not provided)
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ?? "";
const WS_RPC_URL = process.env.REACT_APP_TESTNET_WS_RPC_URL ?? "";


// Define types for context to ensure type safety
interface ContractContextType {
  contract: ethers.Contract | null; // Contract instance or null if not yet initialized
  wsContract: ethers.Contract | null; // Provider instance or null if not yet initialized
  address: string | null;
}

// Create context with default values (null for contract and provider)
const ContractContext = createContext<ContractContextType>({
  contract: null,
  wsContract: null,
  address: null
});

// Context Provider Component that manages the contract and provider state
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [wsContract, setWsContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Initialize contract and provider
  const initContract = async () => {
      // Check if window.ethereum is available (ensures MetaMask is installed)
      if (!window.ethereum) {
        notify("Please check your internet connection", "warning"); // Inform the user if no provider is found
        console.log("Please check your internet connection");
        return;
      }

      try {
        // Cast window.ethereum to an EIP-1193 provider type for compatibility with ethers
        const ethereumProvider = window.ethereum as unknown as ethers.Eip1193Provider;
        await ethereumProvider.request({ method: "eth_requestAccounts" }); // Request account access from the user (MetaMask)

        // Initialize the provider with ethers (v6), using the Ethereum provider from MetaMask
        const provider = new ethers.BrowserProvider(ethereumProvider);
        const signer = await provider.getSigner(); // Get the signer from the provider (signer is needed to interact with the blockchain)
        const address = await signer.getAddress(); // Get the user's wallet address
        setAddress(address);
        const network = await provider.getNetwork(); // Fetch network details to ensure the user is connected to the correct network
   
        // If the user is not on the BSC Testnet (Chain ID: 97), attempt to switch to it
        if (Number(network.chainId) !== 97) {
          try {
            await ethereumProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x61" }], // Chain ID for BSC Testnet in hex format
            });
          } catch (error) {
            console.log("Failed to switch to BSC Testnet", error);
          }
        }

        // Initialize the contract with the signer and ABI, then set it in the state
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
        setContract(contract);

        // Set up WebSocket provider to listen for contract events
        const wsProvider = new ethers.WebSocketProvider(WS_RPC_URL); // BSC WebSocket endpoint
        const wsContract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, wsProvider);
        setWsContract(wsContract);
      } catch (error) {
        // If an error occurs, notify the user
        notify("Error initializing contract", "error");
        console.error("Error initializing contract:", error);
      }
    };

    // Call the initContract function once on component mount
    initContract();
  }, []);

  return (
    <ContractContext.Provider value={{ contract, wsContract, address }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook for using contract
export const useContract = () => useContext(ContractContext);

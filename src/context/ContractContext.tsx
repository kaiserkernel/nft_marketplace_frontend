import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { notify } from "../components/common/Notify";

import { ContractABI } from "../contracts/index"; // Make sure the path is correct

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

// Define types for context
interface ContractContextType {
  contract: ethers.Contract | null;
  provider: ethers.Provider | null;
}

// Create context with default values
const ContractContext = createContext<ContractContextType>({
  contract: null,
  provider: null
});

// Context Provider Component
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (!window.ethereum) {
          notify("Please check out Internet connection", "warning");
          console.log("Please check out Internet connection");
          return;
        }
        const _ethereum = window.ethereum as unknown as ethers.Eip1193Provider;

        // Request account access
        await _ethereum.request({ method: "eth_requestAccounts" });

        // Initialize the provider (ethers v6)
        const provider = new ethers.BrowserProvider(_ethereum);
        setProvider(provider);

        // Get the signer (ethers v6 requires an address)
        const signer = await provider.getSigner();

        // Check if the network is BSC Testnet (Chain ID: 97)
        const network = await provider.getNetwork();
        
        if (Number(network.chainId) !== 97) {
          await _ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }], // BSC Testnet Chain ID in hex
          });
        }

        // Initialize contract instance (ethers v6)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
        setContract(contract);
      } catch (error) {
        notify("Initialize contract occur error", "error");
        console.error("Error initializing contract:", error);
      }
    };

    initContract();
  }, []);

  return (
    <ContractContext.Provider value={{ contract, provider }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook for using contract
export const useContract = () => useContext(ContractContext);

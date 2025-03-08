import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ContractABI } from "../contracts/index"; // Make sure the path is correct

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";
const RPC_URL = process.env.REACT_APP_RPC_URL; // Testnet Network

// Define types for context
interface ContractContextType {
  contract: ethers.Contract | null;
}

// Create context with default values
const ContractContext = createContext<ContractContextType>({
  contract: null
});

// Context Provider Component
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
        setContract(contract);
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    initContract();
  }, []);

  return (
    <ContractContext.Provider value={{ contract }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook for using contract
export const useContract = () => useContext(ContractContext);

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, BrowserProvider } from "ethers";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";

import { notify } from "../components/common/Notify";
import { useEthersSigner } from "../utils/GetSigner";
import { ThreeDot } from "react-loading-indicators";

// WebSocket URL from environment variables
const WS_RPC_URL = process.env.REACT_APP_TESTNET_WS_RPC_URL ?? "";

// Define context types
interface ContractContextType {
  signer: ethers.JsonRpcSigner | null;
  wsProvider: ethers.WebSocketProvider | null;
}

// Create the contract context
const ContractContext = createContext<ContractContextType>({
  signer: null,
  wsProvider: null,
});

// Context Provider Component
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [wsProvider, setWsProvider] = useState<ethers.WebSocketProvider | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { address, isConnected } = useAccount();
  const _signer = useEthersSigner();

  useEffect(() => {
    let _wsProvider: ethers.WebSocketProvider | null = null;

    const initContract = async (_address: string) => {
      try {
        setLoading(true);

        if (!isConnected) {
          console.warn("Wallet is not connected");
          return;
        }

        // Setup WebSocket provider
        if (WS_RPC_URL) {
          _wsProvider = new ethers.WebSocketProvider(WS_RPC_URL);
          setWsProvider(_wsProvider);
        } else {
          notify("WebSocket RPC URL is missing", "error");
        }

        if (_signer) {
          setSigner(_signer);
        }
      } catch (error) {
        console.error("Error initializing contract:", error);
        notify("Error initializing contract", "error");
      } finally {
        setLoading(false);
      }
    };

    if (isConnected && address) {
      initContract(address);
    } else if (!loading) {
      navigate("/");
    }

    return () => {
      if (_wsProvider) _wsProvider.destroy();
    };
  }, [isConnected, address, navigate, _signer]);

  if (loading) {
    return <ThreeDot size="large" color="#fff" />;
  }

  return (
    <ContractContext.Provider value={{ signer, wsProvider }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook to use contract
export const useContract = () => useContext(ContractContext);

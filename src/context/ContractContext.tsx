import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ethers } from "ethers";
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
  const wsProviderRef = useRef<ethers.WebSocketProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { address, isConnected } = useAccount();
  const _signer = useEthersSigner();

  useEffect(() => {
    let _wsProvider: ethers.WebSocketProvider | null = null;

    const reconnectWebSocket = () => {
      if (!WS_RPC_URL) return;

      console.log("Reconnecting WebSocket...");
      _wsProvider = new ethers.WebSocketProvider(WS_RPC_URL);
      setWsProvider(_wsProvider);

      (_wsProvider as any)._websocket.onclose = () => {
        console.warn("WebSocket closed again. Reconnecting...");
        setTimeout(reconnectWebSocket, 3000); // Wait 3s before reconnecting
      };
    };

    const initContract = async (_address: string) => {
      try {
        setLoading(true);

        if (!isConnected) {
          console.warn("Wallet is not connected");
          return;
        }

        if (_signer) {
          setSigner(_signer);
        }

        if (wsProviderRef.current) {
          console.warn("Websocket provider is already created");
          return;
        }

        // Setup WebSocket provider
        if (WS_RPC_URL) {
          _wsProvider = new ethers.WebSocketProvider(WS_RPC_URL);
          wsProviderRef.current = _wsProvider;
          setWsProvider(_wsProvider);

          // Ensure _websocket exists before setting the onclose handler
          if ((_wsProvider as any)._websocket) {
            (_wsProvider as any)._websocket.onclose = () => {
              console.warn("WebSocket closed. Attempting to reconnect...");
              setTimeout(reconnectWebSocket, 3000);
            };
          } else {
            console.warn("WebSocket object not found in provider.");
          }
        } else {
          notify("WebSocket RPC URL is missing", "error");
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
  }, [isConnected, address, navigate, _signer]);

  // if (loading) {
  //   return <ThreeDot size="large" color="#fff" />;
  // }

  return (
    <ContractContext.Provider value={{ signer, wsProvider }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook to use contract
export const useContract = () => useContext(ContractContext);

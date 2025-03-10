import { useState, useEffect } from "react";
import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { BrowserProvider, formatEther } from "ethers";
import { Address } from "@reown/appkit-adapter-ethers";
import { bscTestnet } from "@reown/appkit/networks";

const useWallet = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { chainId, switchNetwork } = useAppKitNetwork();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [walletAvatar, setWalletAvatar] = useState<any>(null);

  useEffect(() => {
    console.log("use wallet")
    const getAllUserInfo = async () => {
      try {
        const provider = new BrowserProvider(walletProvider, chainId);
    
        // Get balance
        const balance = await provider.getBalance(address as Address);
        const eth = formatEther(balance);
        setWalletBalance(eth);
    
        // Get avatar
        try {
          // Ensure `getAvatar` is available
          if (provider.getAvatar) {
            const avatar = await provider.getAvatar(address as Address);
            setWalletAvatar(avatar);
          } else {
            console.log("Avatar fetching is not supported by this provider.");
            setWalletAvatar(null); // Handle gracefully
          }
        } catch (avatarError) {
          console.log("Failed to fetch wallet avatar:", avatarError);
          setWalletAvatar(null); // Handle missing avatar gracefully
        }
      } catch (error) {
        console.log("Error fetching user info:", error);
      }
    };

    if (isConnected && address) {
      if (chainId !== bscTestnet.id) {
        switchNetwork(bscTestnet);
      }
      setWalletAddress(address);
      setIsWalletConnected(true);
      getAllUserInfo();
    } else {
      // setWalletAddress(null);
      // setIsWalletConnected(false);
      // setWalletBalance(null);
      // setWalletAvatar(null);
    }
  }, [isConnected, address, chainId, walletProvider, switchNetwork]);

  return {
    walletAddress,
    isWalletConnected,
    walletBalance,
    walletAvatar,
  };
};

export default useWallet;

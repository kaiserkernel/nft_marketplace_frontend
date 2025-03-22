import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, bsc, bscTestnet } from "wagmi/chains";
import { injected, metaMask } from '@wagmi/connectors'
import { createConfig, http } from '@wagmi/core'
import { createClient } from 'viem'

export const config = getDefaultConfig({
  appName: "NFT_Marketplace",
  projectId: process.env.REACT_APP_PROJECT_ID || "",
  chains: [mainnet, bsc, bscTestnet],
});

// export const wagmiConfig = createConfig({
//   chains: [mainnet, bsc, bscTestnet],
//   connectors: [injected(), metaMask()], 
//   client({ chain }) {
//     return createClient({ chain, transport: http() })
//   },
// })

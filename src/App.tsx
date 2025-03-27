import { Routes, Route } from "react-router-dom"; // Import BrowserRouter
import "./App.css";
import Container from "./components/layouts/Container";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SingleNFT from "./pages/CreateNFT/SingleNFT";
import CreateInCollection from "./pages/CreateNFT/InCollection";
import CollectionView from "./pages/CollectionView/CollectionView";
import AuctionView from "./pages/AutionView";

import { ContractProvider } from "./context/ContractContext";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

import { config } from "./config/wagmiConfig";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={darkTheme()}>
          <ContractProvider>
            <Container>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-single" element={<SingleNFT />} />
                <Route
                  path="/create-in-collection"
                  element={<CreateInCollection />}
                />
                <Route path="/collection-view" element={<CollectionView />} />
                <Route path="/auction-view" element={<AuctionView />} />
              </Routes>
            </Container>
          </ContractProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

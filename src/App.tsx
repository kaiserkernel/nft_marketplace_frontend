import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import BrowserRouter
import "./App.css";
import Container from "./components/layouts/Container";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { bsc, mainnet, bscTestnet } from "@reown/appkit/networks";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SingleNFT from "./pages/CreateNFT/SingleNFT";
import CreateInCollection from "./pages/CreateNFT/InCollection";
import CollectionView from "./pages/CollectionView/CollectionView";
import AuctionView from "./pages/AutionView";

// 1. Get projectId
const projectId = "2107c00a7b77ee5371a8e43b5c13a4e6";

// 2. Create a metadata object - optional
const metadata = {
  name: "Charlie Unicorn AI presale website",
  description: "Charlie Unicorn AI presale website",
  url: "https://charlietheunicoin.shop/", // origin must match your domain & subdomain
  icons: ["/public/logo.png"],
};

// 3. Create an AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks: [bsc, mainnet, bscTestnet],
  metadata,
  projectId,
  features: {
    analytics: false,
    socials: false,
    email: false,
  },
});

function App() {
  return (
    <Container>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-single" element={<SingleNFT />} />
        <Route path="/create-in-collection" element={<CreateInCollection />} />
        <Route path="/collection-view" element={<CollectionView />} />
        <Route path="/auction-view" element={<AuctionView />} />
      </Routes>
    </Container>
  );
}

export default App;

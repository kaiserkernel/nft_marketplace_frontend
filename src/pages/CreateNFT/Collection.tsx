import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

import NFTBanner from "../../components/common/NFTBanner";
import CollectionAvatar from "../../components/common/CollectionAvatar";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import Button from "../../components/common/Button";

import useWallet from "../../hooks/useWallet";

interface CreateCollectionProps {
  btnClicked: boolean;
}

const ContractAPI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "collectionAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "image",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "avatar",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "royalty",
        "type": "uint256"
      }
    ],
    "name": "CollectionCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "image",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "avatar",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "royalty",
        "type": "uint256"
      }
    ],
    "name": "createCollection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const CreateCollection: React.FC<CreateCollectionProps> = ({ btnClicked }) => {
  const [image, setImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [displayDescription, setDisplayDescription] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [royaltyCollection, setRoyaltyCollection] = useState<string>("");
  const isMounted = useRef(true); // Track first render
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { isWalletConnected, walletAddress, walletBalance } = useWallet();

  useEffect(() => {
    if (isMounted.current) {
      isMounted.current = false; // Skip first execution
      return;
    }

    // Create Collection
    console.log('clicked')
  }, [btnClicked]);

  const handleRoyaltySelection = (percent: string) => {
    setRoyaltyCollection(percent);
  };

  return (
    <div>
      <NFTBanner height={300} image={image} setImage={setImage}/>
      <div className="mt-8">
        <h3 className="text-white font-semibold text-md">
          Your Collection’s Avatar
        </h3>
        <div className="mt-2">
          <CollectionAvatar />
        </div>
      </div>

      {/* Name */}
      <div className="mt-8">
        <h3 className="text-white font-semibold text-md mb-2">
          Display Name
        </h3>
        <InputField
          itemType="default"
          type="text"
          name="displayName"
          placeholder="Name your NFT"
          bordered
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="h-4"></div>
      <TextArea
        label="Description"
        placeholder="Describe what the idea is, how the NFT was created, or why people should buy it."
        value={displayDescription}
        onChange={(value: string) => setDisplayDescription(value)}
      />

      {/* Token Symbol */}
      <div className="mt-4">
        <h3 className="text-white font-semibold text-md mb-2">
          Token symbol
        </h3>
        <InputField
          itemType="default"
          type="text"
          name="tokenSymbol"
          placeholder="MCN"
          bordered
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
        />
      </div>

      {/* Royalties for the Creator */}
      <div className="mt-4">
        <h3 className="text-white font-semibold text-md mb-2">
          Royalties for the Creator
        </h3>
        <InputField
          itemType="default"
          type="text"
          name="royalty"
          placeholder="0%"
          bordered
          value={royaltyCollection}
          onChange={(e) => setRoyaltyCollection(e.target.value)}
        />
        <div className="flex flex-row items-center gap-2 mt-2">
          {["0%", "10%", "20%", "30%"].map((percent) => (
            <Button
              key={percent}
              type="primary"
              label={percent}
              onClick={() => handleRoyaltySelection(percent)}
            />
          ))}
        </div>
        <p className="text-white/70 text-xs mt-2 px-1">
          Collect royalties every time your NFT is sold. The amount is
          deducted from the final sale price and sent to your address.
        </p>
      </div>
    </div>
  );
};

export default CreateCollection;

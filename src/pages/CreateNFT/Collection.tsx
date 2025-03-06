import React, { useState, useEffect, useRef } from "react";

import NFTBanner from "../../components/common/NFTBanner";
import CollectionAvatar from "../../components/common/CollectionAvatar";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import Button from "../../components/common/Button";
import { notify } from "../../components/common/Notify";

import useWallet from "../../hooks/useWallet";

import { useContract } from "../../context/ContractContext";

interface CreateCollectionProps {
  btnClicked: boolean;
}

interface CollectionData {
  displayName: string;
  tokenSymbol: string;
  royaltyCollection: number;
}

const CreateCollection: React.FC<CreateCollectionProps> = ({ btnClicked }) => {
  const [image, setImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [displayDescription, setDisplayDescription] = useState<string>("");
  const isMounted = useRef(true); // Track first render
  const [collectionData, setCollectionData] = useState<CollectionData>({
    displayName: "",
    tokenSymbol: "",
    royaltyCollection: 0
  })

  const { contract } = useContract();
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { isWalletConnected, walletAddress, walletBalance } = useWallet();

  const validatorForm = () => {
    if (!collectionData.displayName || !collectionData.tokenSymbol || !collectionData.royaltyCollection || !displayDescription || !image || !avatarImage) {
      notify("Please complete all fields", "warning");
      return false;
    }
    return true;
  }

  // useEffect(() => {
  //   if (isMounted.current) {
  //     isMounted.current = false; // Skip first execution
  //     return;
  //   }
  // }, [btnClicked]);

  const handleRoyaltySelection = (percent: number) => {
    setCollectionData(prev => ({...prev, royaltyCollection: percent}));
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value}  = evt.target;
    if (name === 'royaltyCollection') {
      const _royalty = Number(value);
      if (isNaN(_royalty)) {
        notify("Please input number on royalty", "error");
        return;
      }
      if (_royalty > 50) {
        notify("Please set royalty less than 50", "error");
        return;
      }
    }
    setCollectionData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleCreateCollection = () => {
    if (contract) {
      const validateResult = validatorForm();

      if (!validateResult) return;

      // Create Collection
      const createCollection = async () => {
        try {
          setIsProcessing(true);
          const tx = await contract.createCollection(
            collectionData.displayName,
            collectionData.tokenSymbol,
            displayDescription,
            image,
            avatarImage,
            500
          );
          await tx.wait();
          // alert("Collection created successfully!");
          notify("Collection created successfully", "success");
        } catch (error) {
          console.error("Error creating collection:", error);
          notify("Error occured on creating collection", "error");
        } finally {
          setIsProcessing(false);
        }
      };
      createCollection();
    }    
  }

  return (
    <div>
      <NFTBanner 
        height={300} 
        image={image} 
        setImage={setImage}
      />
      <div className="mt-8">
        <h3 className="text-white font-semibold text-md">
          Your Collection’s Avatar
        </h3>
        <div className="mt-2">
          <CollectionAvatar 
            avatarImage={avatarImage} 
            setAvatarImage={setAvatarImage}
          />
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
          placeholder="Name your Collection"
          bordered
          value={collectionData.displayName}
          onChange={handleChange}
        />
      </div>

      {/* Description */}
      <div className="h-4"></div>
      <TextArea
        label="Description"
        placeholder="Exclusive NFTs that blend art and blockchain. Own a unique piece of digital art!"
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
          value={collectionData.tokenSymbol}
          onChange={handleChange}
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
          name="royaltyCollection"
          placeholder="0%"
          bordered
          value={collectionData.royaltyCollection}
          onChange={handleChange}
        />
        <div className="flex flex-row items-center gap-2 mt-2">
          {([["0%", 0], ["10%", 10], ["20%", 20], ["30%", 30]] as Array<[string, number]>).map((percent) => (
            <Button
              key={percent[0]}
              type="primary"
              label={percent[0]}
              onClick={() => handleRoyaltySelection(percent[1])}
            />
          ))}
        </div>
        <p className="text-white/70 text-xs mt-2 px-1">
          Collect royalties every time your NFT is sold. The amount is
          deducted from the final sale price and sent to your address.
        </p>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-1 w-full p-4">
        <Button
          label={"Create Collection"}
          type="blue"
          width="full"
          onClick={handleCreateCollection}
        />
      </div>
    </div>
  );
};

export default CreateCollection;

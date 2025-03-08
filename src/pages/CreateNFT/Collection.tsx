import React, { useState, useEffect, useRef } from "react";
import { FileObject } from "pinata";

import CollectionLogo from "../../components/common/CollectionLogo"
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import Button from "../../components/common/Button";
import { notify } from "../../components/common/Notify";
import Modal from "../../components/common/Modal";

import useWallet from "../../hooks/useWallet";
import { useContract } from "../../context/ContractContext";
import { pinata } from "../../utils/config";

import { createCollection } from "../../services/colllectionService";

interface CreateCollectionProps {
  isOpen: boolean,
  onClose: () => void
}

interface CollectionData {
  name: string;
  tokenSymbol: string;
}

const CreateCollection:React.FC<CreateCollectionProps> = ({isOpen, onClose}) => {
  const [LogoImage, setLogoImage] = useState<string | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<FileObject | null>(null);
  const [description, setDescription] = useState<string>("");
  const isMounted = useRef(true); // Track first render
  const [collectionData, setCollectionData] = useState<CollectionData>({
    name: "",
    tokenSymbol: ""
  })

  const { contract } = useContract();
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { isWalletConnected, walletAddress, walletBalance } = useWallet();

  const validatorForm = () => {
    if (!collectionData.name || !collectionData.tokenSymbol || !description || !LogoImage) {
      notify("Please complete all fields", "warning");
      return false;
    }
    return true;
  }

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

  const handleCreateCollection = async () => {
    if (!contract) return
    if (!validatorForm()) return;
    if (!logoImageFile) return;
      
    setIsProcessing(true);

    // Create Collection
    try {
      // upload images to IPFS
      const uploadLogoImage = await pinata.upload.public.file(logoImageFile);
      const imageURL = await pinata.gateways.public.convert(uploadLogoImage.cid);
      console.log(imageURL, 'avatar image url');
  
      // Create metadata JSON
      const metadata = {
        name: collectionData.name,
        description,
        image: imageURL,
      };

      // Upload metadata JSON to IPFS
      const metadataUpload = await pinata.upload.public.json(metadata);
      const metadataURI = await pinata.gateways.public.convert(metadataUpload.cid);

      // Call smart contract to create collection
      const tx = await contract.createCollection(
        collectionData.name,
        collectionData.tokenSymbol,
        metadataURI
      );

      const receipt = await tx.wait();
      const collectionAddress = receipt.events[0].args.collectionAddress;

      // Save collection data to backend (MongoDB)
      const _collectionData = {
        name: collectionData.name,
        symbol: collectionData.tokenSymbol,
        description,
        image: imageURL,
        metadataURI,
        owner: walletAddress,
        contractAddress: collectionAddress
      }
      const collection = await createCollection(_collectionData);
      notify("Collection created successfully", "success");
    } catch (error) {
      console.error("Error creating collection:", error);
      notify("Error occured on creating collection", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  const footerBtn = () => {
    return (
      <div className="absolute bottom-1 p-4 w-full">
        <Button
          label={"Create Collection"}
          type="blue"
          width="full"
          onClick={handleCreateCollection}
          disabled={isProcessing}
        />
      </div>
    )
  }

  useEffect(() => {
    // initialize all state
    setLogoImage(null);
    setDescription("");
    setCollectionData({
      name: "",
      tokenSymbol: ""
    })
  } , [isOpen])

  return (
    <Modal
      title="Create a Collection"
      isOpen={isOpen}
      onClose={onClose}
      FooterBtn={footerBtn}
    >
      <div className="mt-8">
        <h3 className="text-white font-semibold text-md">
          Your Collection’s Avatar
        </h3>
        <div className="mt-2">
          <CollectionLogo 
            logoImage={LogoImage} 
            setLogoImage={setLogoImage}
            setLogoImageFile={setLogoImageFile}
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
          name="name"
          placeholder="Name your Collection"
          bordered
          value={collectionData.name}
          onChange={handleChange}
        />
      </div>

      {/* Description */}
      <div className="h-4"></div>
      <TextArea
        label="Description"
        placeholder="Exclusive NFTs that blend art and blockchain. Own a unique piece of digital art!"
        value={description}
        onChange={(value: string) => setDescription(value)}
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
      
    </Modal>
  );
};

export default CreateCollection;

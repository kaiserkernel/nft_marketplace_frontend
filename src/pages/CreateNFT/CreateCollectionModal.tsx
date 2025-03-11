import React, { useState, useEffect } from "react";
import { FileObject } from "pinata";

import CollectionLogo from "../../components/common/CollectionLogo"
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import Button from "../../components/common/Button";
import { notify } from "../../components/common/Notify";
import Modal from "../../components/common/Modal";

import { useContract } from "../../context/ContractContext";
import { pinata } from "../../config/pinata";

interface CreateCollectionModalProps {
  isOpen: boolean,
  onClose: () => void
}

interface CollectionData {
  name: string;
  tokenSymbol: string;
}

const CreateCollectionModal:React.FC<CreateCollectionModalProps> = ({isOpen, onClose}) => {
  const [LogoImage, setLogoImage] = useState<string | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<FileObject | null>(null);
  const [description, setDescription] = useState<string>("");
  const [collectionData, setCollectionData] = useState<CollectionData>({
    name: "",
    tokenSymbol: ""
  })
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { contract, wsContract } = useContract();

  // Validate form before creating collection
  const validatorForm = (): boolean => {
    if (!collectionData.name || !collectionData.tokenSymbol || !description || !LogoImage) {
      notify("Please complete all fields", "warning");
      return false;
    }
    return true;
  }

  // Handle input changes
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value}  = evt.target;

    setCollectionData(prev => ({ ...prev, [name]: value }));
  }

  const handleCreateCollection = async () => {
    if (!contract) {
      notify("Please check internet connection", "error");
      return;
    }
    if (!validatorForm()) {
      return;
    }
    if (!logoImageFile) {
      notify("Please check logo image again", "error")
      return;
    }
      
    setIsProcessing(true);

    // Create Collection
    try {
      // upload images to IPFS
      const uploadLogoImage = await pinata.upload.public.file(logoImageFile);
      const imageURL = await pinata.gateways.public.convert(uploadLogoImage.cid);
  
      // Create metadata JSON and upload to IPFS
      const metadata = { description, image: imageURL };
      const metadataUpload = await pinata.upload.public.json(metadata);
      const metadataURI = await pinata.gateways.public.convert(metadataUpload.cid);
      
      // Estimate the gas required for the transaction
      const gasEstimate = await contract.createCollection.estimateGas(
        collectionData.name,
        collectionData.tokenSymbol,
        metadataURI
      );

      // Call smart contract to create collection
      const tx = await contract.createCollection( collectionData.name, collectionData.tokenSymbol, metadataURI, { 
        gasLimit: gasEstimate 
      });

      await tx.wait();
      notify("Collection created successfully", "success");
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        notify("Transaction rejected by user.", "warning");
      } else {
        console.error("Error creating collection:", error);
        notify("Error occured on creating collection", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    // initialize all state
    if (!isOpen) return;
    
    setLogoImage(null);
    setDescription("");
    setCollectionData({ name: "", tokenSymbol: ""});
  } , [isOpen])

  return (
    <Modal
      title="Create a Collection"
      isOpen={isOpen}
      onClose={onClose}
      btnLabel="Create Collection"
      btnType="blue"
      btnClick={handleCreateCollection}
      btnProcessing={isProcessing}
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

export default CreateCollectionModal;

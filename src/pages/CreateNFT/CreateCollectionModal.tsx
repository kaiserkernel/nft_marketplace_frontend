import React, { useState, useEffect, useMemo } from "react";
import { FileObject } from "pinata";
import { ethers } from "ethers";

import CollectionLogo from "../../components/common/CollectionLogo";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import { notify } from "../../components/common/Notify";
import Modal from "../../components/common/Modal";

import { createCollectionDB } from "../../services/colllectionService";
import { useContract } from "../../context/ContractContext";
import { pinata } from "../../config/pinata";
import { TransactionErrorhandle } from "../../utils/TransactionErrorhandle";
import { ContractFactoryABI } from "../../contracts";

// Environment variable for contract address (default to an empty string if not provided)
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ?? "";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CollectionData {
  name: string;
  tokenSymbol: string;
}

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
  setCreated,
}) => {
  const [LogoImage, setLogoImage] = useState<string | null>(null);
  // const [logoImageFile, setLogoImageFile] = useState<FileObject | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [collectionData, setCollectionData] = useState<CollectionData>({
    name: "",
    tokenSymbol: "",
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { signer, wsProvider } = useContract();

  const contract = useMemo(() => {
    return new ethers.Contract(CONTRACT_ADDRESS, ContractFactoryABI, signer);
  }, [signer]);
  // setContract(contractInstance);

  // Set up WebSocket provider to listen for contract events
  const wsContract = useMemo(() => {
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      ContractFactoryABI,
      wsProvider
    );
  }, [wsProvider]);

  // Validate form before creating collection
  const validatorForm = (): boolean => {
    if (
      !collectionData.name ||
      !collectionData.tokenSymbol ||
      !description ||
      !LogoImage
    ) {
      notify("Please complete all fields", "warning");
      return false;
    }
    return true;
  };

  // Handle input changes
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setCollectionData((prev) => ({ ...prev, [name]: value }));
  };

  // Create collection logic
  const handleCreateCollection = async () => {
    if (!contract) {
      notify("Please check wallet connection", "error");
      return;
    }
    if (!validatorForm()) {
      return;
    }
    if (!logoImageFile) {
      notify("Please check logo image again", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // upload images to IPFS
      const uploadLogoImage = await pinata.upload.public.file(logoImageFile);
      const imageURL = await pinata.gateways.public.convert(
        uploadLogoImage.cid
      );

      // // Create metadata JSON and upload to IPFS
      const metadata = { description, image: imageURL };
      const metadataUpload = await pinata.upload.public.json(metadata);
      const metadataURI = await pinata.gateways.public.convert(
        metadataUpload.cid
      );

      // Estimate the gas required for the transaction
      const gasEstimate = await contract.createCollection.estimateGas(
        collectionData.name,
        collectionData.tokenSymbol,
        metadataURI
      );

      const tx = await contract.createCollection(
        collectionData.name,
        collectionData.tokenSymbol,
        metadataURI,
        {
          gasLimit: gasEstimate,
        }
      );

      const log = await tx.wait();

      // log.logs[0].address -> contractAddress
      // log.from -> owner address

      notify("Collection created successfully", "success");
    } catch (error: any) {
      console.log(error, "error");
      TransactionErrorhandle(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create collection on DB - off chain
  const handleCollectionCreated = async (
    owner: string,
    collectionAddress: string,
    name: string,
    symbol: string,
    metadataURI: string
  ) => {
    const _collectionData = {
      name,
      symbol,
      metadataURI,
      owner,
      contractAddress: collectionAddress,
    };
    try {
      await createCollectionDB(_collectionData);
      setCreated((prev) => !prev);
      onClose();
    } catch (error) {
      notify("Failed to create collection", "error");
    }
  };

  // Reset form when modal is closed or opened
  useEffect(() => {
    if (!isOpen) return;
    setLogoImage(null);
    setDescription("");
    setCollectionData({ name: "", tokenSymbol: "" });
  }, [isOpen]);

  // Handle contract event for collection creation
  useEffect(() => {
    if (!wsContract) return;

    // Define the event listener function outside the effect to avoid unnecessary re-creation
    const onCollectionCreated = (
      owner: string,
      collectionAddress: string,
      name: string,
      symbol: string,
      metadataURI: string
    ) => {
      handleCollectionCreated(
        owner,
        collectionAddress,
        name,
        symbol,
        metadataURI
      );
    };

    // Attach event listener to the contract
    if (isOpen) {
      wsContract.on("CollectionCreated", onCollectionCreated);
    }

    // Cleanup function to remove the listener when modal closes or wsContract changes
    return () => {
      if (wsContract) {
        wsContract.off("CollectionCreated", onCollectionCreated);
      }
    };
  }, [wsContract, isOpen]); // Make sure the effect is triggered when `wsContract` or `isOpen` changes

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
        <h3 className="text-white font-semibold text-md mb-2">Display Name</h3>
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
        <h3 className="text-white font-semibold text-md mb-2">Token symbol</h3>
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

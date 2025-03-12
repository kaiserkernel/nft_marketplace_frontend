import React, { useState,  useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { FileObject } from "pinata";
import { OrbitProgress } from "react-loading-indicators"
import { ethers } from "ethers";

import { ContractCollectionABI } from "../../contracts";

import CreateCollectionModal from "./CreateCollectionModal";
import CollectionSelectModal from "./CollectionSelectModal"

import CollectionBtnGroup from "../../components/common/CollectionSmBtnGroup";
import NFTBanner from "../../components/common/NFTBanner";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import AttributeInput from "../../components/common/AttributeInput";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import { notify } from "../../components/common/Notify";

import { useContract } from "../../context/ContractContext";
import { CollectionProps, NFTMetaData } from "../../types";
import { fetchOwnerCollection } from "../../services/colllectionService";
import { mintNFTDB } from "../../services/nftService";
import { pinata } from "../../config/pinata";

const CreateInCollection = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [displayDescription, setDisplayDescription] = useState<string>("");
  const [attributes, setAttributes] = useState<{ trait: string; value: string }[]>([]);
  const [royaltyNFT, setRoyaltyNFT] = useState<number>(0);
  const [image, setImage] = useState<FileObject | null>(null);

  const [collections, setCollections] = useState<CollectionProps[] | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionProps | null>(null);
  
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState<boolean>(false);
  const [isSelectCollectionModalOpen, setIsSelectCollectionModalOpen] = useState<boolean>(false);

  const [confirmedCollectionAddress, setConfirmedCollectionAddress] = useState<string | null>(null);
  const [collectionCreatedFlag, setCollectionCreatedFlag] = useState<boolean>(false);

  const [isCollectionProcessing, setIsCollectionProcessing] = useState<boolean>(false);
  const [isNFTProcessing, setIsNFTProcessing] = useState<boolean>(false);

  const { walletAddress, signer, wsProvider } = useContract();

  const [collectionContract, setCollectionContract] = useState<ethers.Contract | null>(null);
  const [wsCollectionContract, setWsCollectionContract] = useState<ethers.Contract | null>(null);

  const validatorForm = () => {
    if (!displayName || !displayDescription) {
      notify("Please complete input field", "warning");
      return false
    }
    return true;
  }

  const formatAttributes = () => {
    const _attributes = attributes.filter(log => log.trait && log.value);
    return _attributes;
  }

  const handleAddAttribute = () => {
    setAttributes([...attributes, { trait: "", value: "" }]);
  };

  const handleAttributeChange = (index: number, field: "trait" | "value", newValue: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: newValue } : attr))
    );
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoyaltyChange = (percent: string) => {
    const _percent = Number(percent);
    if ( isNaN(_percent) ) {
      notify("Please input number as royalty", "warning");
      return;
    }
    if (_percent > 50) {
      notify("Please input number less then 50", "warning");
      return;
    }
    setRoyaltyNFT(_percent);
  };

  const handleOpenCollectionModal = async () => {
    setIsCreateCollectionModalOpen(true);
  };

  const handleClickMint = async () => {
    if (!validatorForm) return;
    if (!walletAddress || !signer || !wsProvider) {
      notify("Please check wallet connection", "warning");
      return;
    }
    if (!confirmedCollectionAddress || !collectionContract) {
      notify("Please select collection", "warning");
      return;
    }
    if (!image) {
      notify("Please input image", "warning")
      return;
    }

    setIsNFTProcessing(true);

    const _attributes = formatAttributes();
    try {
      // upload images to IPFS
      const uploadLogoImage = await pinata.upload.public.file(image);
      const imageURL = await pinata.gateways.public.convert(uploadLogoImage.cid);
  
      // Create metadata JSON and upload to IPFS
      const metadata: NFTMetaData = { name: displayName, description: displayDescription, image: imageURL };
      if (attributes.length > 0) {
        metadata.attributes = _attributes;
      }
      const metadataUpload = await pinata.upload.public.json(metadata);
      const metadataURI = await pinata.gateways.public.convert(metadataUpload.cid);
      
      const _royaltyNFT = royaltyNFT * 100;
      
      // Estimate the gas required for the transaction
      const gasEstimate = await collectionContract.mintNFT.estimateGas(
        walletAddress,
        metadataURI,
        _royaltyNFT
      );
      
      // Call smart contract to create collection
      const tx = await collectionContract.mintNFT( walletAddress, metadataURI, _royaltyNFT, { 
        gasLimit: gasEstimate 
      });

      await tx.wait();
      notify("NFT minted successfully", "success");
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        notify("Transaction rejected.", "warning");
      } else {
        console.error("Error mint NFT:", error);
        notify("Error occured on mint NFT", "error");
      }
    } finally {
      setIsNFTProcessing(false);
    }
  }

  useEffect(() => {
    if (!confirmedCollectionAddress) return;

    const contractInstance = new ethers.Contract(confirmedCollectionAddress, ContractCollectionABI, signer);
    setCollectionContract(contractInstance);

    const _wsContractInstance =  new ethers.Contract(confirmedCollectionAddress, ContractCollectionABI, wsProvider);
    setWsCollectionContract(_wsContractInstance);

  }, [confirmedCollectionAddress, wsProvider])

  useEffect(() => {
    if (!walletAddress) return;

    const fetchCollections = async () => {
      setIsCollectionProcessing(true);

      try {
        const { collection } = await fetchOwnerCollection(walletAddress);
        if (collection) {
          setCollections(collection);
        } else {
          setIsCollectionProcessing(false);
        }
      } catch (error) {
        setIsCollectionProcessing(false);
      }
    }

    fetchCollections();
  }, [walletAddress, collectionCreatedFlag])

  useEffect(() => {
    if (!wsCollectionContract) return;
    
    const handleMintNFTDB = async (
      owner: string,
      _tokenId: number,
      tokenURI: string,
      _royalty: number,
      collection: string
    ) => {
      try {
        const tokenId = Number(_tokenId);
        const royalty = Number(_royalty);
        const _nftData = { owner, tokenId, tokenURI, royalty, collection };
        await mintNFTDB(_nftData);
      } catch (error) {
        console.log("Create NFTDB data occur error", error)
      }
    }

    try {
      // Attach event listener to the contract
      console.log("ws listener")
      wsCollectionContract.on("NFTMinted", handleMintNFTDB);
    } catch (error) {
      console.error("Error setting up event listener:", error);
    }
  }, [wsCollectionContract])

  return (
    <div className="w-full flex gap-10">
      <ToastContainer/>
      <div className="basis-1/2">
        <NFTBanner height={800} setImage={setImage} />
      </div>
      <div className="basis-1/2 flex flex-col justify-between">
        <h2 className="text-white text-2xl font-semibold">Create an NFT in a Collection</h2>

        {/* Display Name */}
        <div className="mt-4">
          <h3 className="text-white font-semibold text-md mb-2">Display Name</h3>
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
        <div className="mt-4">
          <TextArea
            label="Description"
            placeholder="Describe the idea behind your NFT and explain how it stands out from the rest."
            value={displayDescription}
            onChange={(_value) => setDisplayDescription(_value)}
          />
        </div>

        {/* Collection Modal Trigger */}
          <div className="mt-4">
            <h3 className="text-white font-semibold text-md">Collection</h3>
            <div className="mt-2 flex space-x-4">
            {
              isCollectionProcessing && <OrbitProgress color="#fff" size="medium" />
            }
            {
              collections && (
                <CollectionBtnGroup 
                  collections={collections} 
                  setSelectedCollection={setSelectedCollection} 
                  setIsProcessing={setIsCollectionProcessing} 
                  setIsSelectCollectionModalOpen={setIsSelectCollectionModalOpen}
                  confirmedCollectionAddress={confirmedCollectionAddress}
                />
              )
            }
            
            {/* Button Group in Horizontal Row */}
            {
              !isCollectionProcessing && (
                <button 
                  onClick={handleOpenCollectionModal} 
                  className="relative w-32 h-32 bg-white text-black font-bold border-4 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:bg-gray-100"
                >
                  {/* Plus Sign that Grows on Hover */}
                  <span className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-black group-hover:scale-125 transition-all duration-300 transform">
                    +
                  </span>

                  {/* Border */}
                  <span className="absolute inset-0 border-8 border-transparent rounded-lg"></span>
                </button>
              )
            }
          </div>
        </div>

        {/* Royalties */}
        <div className="mt-4">
          <h3 className="text-white font-semibold text-md mb-2">Royalties for the Creator</h3>
          <InputField
            itemType="default"
            type="text"
            name="royalty"
            placeholder="0%"
            bordered
            value={royaltyNFT}
            onChange={(e) => handleRoyaltyChange(e.target.value)}
          />
          <div className="flex flex-row items-center gap-2 mt-2">
            {["0", "10", "20", "30"].map((percent) => (
              <Button
                key={percent}
                type="primary"
                label={percent + "%"}
                onClick={() => handleRoyaltyChange(percent)}
              />
            ))}
          </div>
          <p className="text-white/70 text-sm mt-2">
            Collect royalties every time your NFT is sold. The amount is
            deducted from the final sale price and sent to your address.
          </p>
        </div>

        {/* Attributes */}
        <div className="mt-4">
          <h3 className="text-white font-semibold text-md">Attributes</h3>
          <div className="grid grid-cols-2 gap-4">
            {attributes.map((attr, index) => (
              <AttributeInput
                key={index}
                trait={attr.trait}
                value={attr.value}
                onChangeTrait={(e) => handleAttributeChange(index, "trait", e.target.value)}
                onChangeValue={(e) => handleAttributeChange(index, "value", e.target.value)}
                onRemove={() => handleRemoveAttribute(index)}
              />
            ))}
          </div>
          <div className="mt-2">
            <Button type="outline" label="Add attribute" onClick={handleAddAttribute} />
          </div>
        </div>

        {/* Alert */}
        <div className="my-4">
          <Alert
            title="It will be impossible to alter the NFT data."
            message="Editing NFTs is currently unavailable."
          />
        </div>

        {/* Create NFT Button */}
        <Button type="blue" label="Create NFT" onClick={handleClickMint} disabled={isNFTProcessing}/>
      </div>

      {/* Modal for Collection Creation */}
      <CreateCollectionModal 
        isOpen={isCreateCollectionModalOpen} 
        onClose={() => setIsCreateCollectionModalOpen(false)}
        setCreated={setCollectionCreatedFlag}
      />

      {/* Modal for Select Collection */}
      { selectedCollection &&  (
        <CollectionSelectModal 
          isOpen={isSelectCollectionModalOpen} 
          onClose={() => setIsSelectCollectionModalOpen(false)} 
          collection={selectedCollection}
          setConfirmedCollectionAddress={setConfirmedCollectionAddress}
        />
      )}
    </div>
  );
};

export default CreateInCollection;

import React, { useState,  useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { FileObject } from "pinata";
import { OrbitProgress } from "react-loading-indicators"

import CreateCollectionModal from "./CreateCollectionModal";
import CollectionSelectModal from "./CollectionSelectModal"

import CollectionBtnGroup from "../../components/common/CollectionSmBtnGroup";
import NFTBanner from "../../components/common/NFTBanner";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import AttributeInput from "../../components/common/AttributeInput";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";

import { useContract } from "../../context/ContractContext";
import { fetchOwnerCollection } from "../../services/colllectionService";
import { CollectionProps } from "../../types";

const CreateInCollection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [attributes, setAttributes] = useState<{ trait: string; value: string }[]>([]);
  const [royaltyNFT, setRoyaltyNFT] = useState<string>("");
  const [imageFile, setImageFile] = useState<FileObject | null>(null);

  const [collections, setCollections] = useState<CollectionProps[] | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionProps | null>(null);
  
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState<boolean>(false);
  const [isSelectCollectionModalOpen, setIsSelectCollectionModalOpen] = useState<boolean>(false);

  const [confirmedCollectionId, setConfirmedCollectionId] = useState<string | null>(null);
  const [collectionCreatedFlag, setCollectionCreatedFlag] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { walletAddress } = useContract();

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
    setRoyaltyNFT(percent);
  };

  const handleOpenCollectionModal = async () => {
    setIsCreateCollectionModalOpen(true);
  };

  const handleClickMint = () => {
    
  }

  useEffect(() => {
    if (!walletAddress) return;

    const fetchCollections = async () => {
      setIsProcessing(true);

      try {
        const { collection } = await fetchOwnerCollection(walletAddress);
        if (collection) {
          setCollections(collection);
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        setIsProcessing(false);
      }
    }

    fetchCollections();
  }, [walletAddress, collectionCreatedFlag])

  return (
    <div className="w-full flex gap-10">
      <ToastContainer/>
      <div className="basis-1/2">
        <NFTBanner height={800} image={image} setImage={setImage} setImageFile={setImageFile}/>
      </div>
      <div className="basis-1/2 flex flex-col justify-between">
        <h2 className="text-white text-2xl font-semibold">Create an NFT in a Collection</h2>

        {/* Display Name */}
        <div>
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
        <TextArea
          label="Description"
          placeholder="Describe the idea behind your NFT and explain how it stands out from the rest."
        />

        {/* Collection Modal Trigger */}
        <div>
          <h3 className="text-white font-semibold text-md">Collection</h3><div className="mt-4 flex space-x-4">
          {
            isProcessing && <OrbitProgress color="#fff" size="medium" />
          }
          {
            collections && (
              <CollectionBtnGroup 
                collections={collections} 
                setSelectedCollection={setSelectedCollection} 
                setIsProcessing={setIsProcessing} 
                setIsSelectCollectionModalOpen={setIsSelectCollectionModalOpen}
                confirmedCollectionId={confirmedCollectionId}
              />
            )
          }
          
          {/* Button Group in Horizontal Row */}
          {
            !isProcessing && (
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
            onChange={(e) => setRoyaltyNFT(e.target.value)}
          />
          <div className="flex flex-row items-center gap-2 mt-2">
            {["0%", "10%", "20%", "30%"].map((percent) => (
              <Button
                key={percent}
                type="primary"
                label={percent}
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
        <div className="mb-4">
          <h3 className="text-white font-semibold text-md">Attributes</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
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
          <div className="h-4"></div>
          <Button type="outline" label="Add attribute" onClick={handleAddAttribute} />
        </div>

        {/* Alert */}
        <div className="mb-4">
          <Alert
            title="It will be impossible to alter the NFT data."
            message="Editing NFTs is currently unavailable."
          />
        </div>

        {/* Create NFT Button */}
        <Button type="blue" label="Create NFT" onClick={handleClickMint}/>
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
          setConfirmedCollectionId={setConfirmedCollectionId}
        />
      )}
    </div>
  );
};

export default CreateInCollection;

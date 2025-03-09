import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { FileObject } from "pinata";

import NFTBanner from "../../components/common/NFTBanner";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import AttributeInput from "../../components/common/AttributeInput";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import CreateCollection from "./Collection";

import { useContract } from "../../context/ContractContext";

const CreateInCollection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [attributes, setAttributes] = useState<{ trait: string; value: string }[]>([]);
  const [royaltyNFT, setRoyaltyNFT] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<FileObject | null>(null);

  const { contract } = useContract();

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
    setIsOpen(true);
    if (contract) {
      // const tx = await contract.getAllCollections();
      // console.log(tx, 'all collections')
    }
  };

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
          <h3 className="text-white font-semibold text-md">Collection</h3>
          <div className="mt-4">
            <Button type="outline" label="Collection" onClick={handleOpenCollectionModal} />
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
        <div>
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
        <Alert
          title="It will be impossible to alter the NFT data."
          message="Editing NFTs is currently unavailable."
        />

        {/* Create NFT Button */}
        <Button type="blue" label="Create NFT" />
      </div>

      {/* Modal for Collection Creation */}
        <CreateCollection isOpen={isOpen} onClose={() => setIsOpen(false)}/>
      {/* </Modal> */}
    </div>
  );
};

export default CreateInCollection;

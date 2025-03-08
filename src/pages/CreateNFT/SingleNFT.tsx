import React, { useState } from "react";
import { FileObject } from "pinata";

import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import Button from "../../components/common/Button";
import AttributeInput from "../../components/common/AttributeInput";
import Alert from "../../components/common/Alert";
import NFTBanner from "../../components/common/NFTBanner";

const SingleNFT = () => {
  const [image, setImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [attributes, setAttributes] = useState<
    { trait: string; value: string }[]
  >([]);
  const [royalty, setRoyalty] = useState<string>("");
  const [imageFile, setImageFile] = useState<FileObject | null>(null);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { trait: "", value: "" }]);
  };

  const handleAttributeChange = (
    index: number,
    field: "trait" | "value",
    newValue: string
  ) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = newValue;
    setAttributes(updatedAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full flex gap-10">
      <div className="basis-1/2">
        <NFTBanner height={800} image={image} setImage={setImage} setImageFile={setImageFile}/>
      </div>
      <div className="basis-1/2 flex flex-col justify-between">
        <h2 className="text-white text-2xl font-semibold">
          Create a Single NFT
        </h2>
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
        <div className="h-4"></div>
        <TextArea
          label="Description"
          placeholder="Describe the idea behind your NFT and explain how it stands out from the rest."
        />
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
            value={royalty}
            onChange={(e) => setRoyalty(e.target.value)}
          />
          <div className="flex flex-row items-center gap-2 mt-2">
            {["0%", "10%", "20%", "30%"].map((percent) => (
              <Button
                key={percent}
                type="primary"
                label={percent}
                onClick={() => setRoyalty(percent)}
              />
            ))}
          </div>
          <p className="text-white/70 text-sm mt-2">
            Collect royalties every time your NFT is sold. The amount is
            deducted from the final sale price and sent to your address.
          </p>
        </div>
        <div className="mt-8">
          <h3 className="text-white font-semibold text-md">Attributes</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {attributes.map((attr, index) => (
              <AttributeInput
                key={index}
                trait={attr.trait}
                value={attr.value}
                onChangeTrait={(e) =>
                  handleAttributeChange(index, "trait", e.target.value)
                }
                onChangeValue={(e) =>
                  handleAttributeChange(index, "value", e.target.value)
                }
                onRemove={() => handleRemoveAttribute(index)}
              />
            ))}
          </div>
          <div className="h-4"></div>
          <Button
            type="outline"
            label="Add attribute"
            onClick={handleAddAttribute}
          />
        </div>
        <div className="h-4"></div>
        <Alert
          title="It will be impossible to alter the NFT data."
          message="Editing NFTs is currently unavailable."
        />
        <div className="h-4"></div>
        <Button type="blue" label="Create NFT" />
      </div>
    </div>
  );
};

export default SingleNFT;

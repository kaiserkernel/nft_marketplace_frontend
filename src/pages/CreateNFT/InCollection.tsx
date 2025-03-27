import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { FileObject } from "pinata";
import { ThreeDot } from "react-loading-indicators";
import { ethers } from "ethers";
import { FaAngleDown } from "react-icons/fa";
import { useAccount } from "wagmi";

import { ContractCollectionABI } from "../../contracts";
import CreateCollectionModal from "./CreateCollectionModal";
import CollectionSelectModal from "./CollectionSelectModal";

import CollectionBtnGroup from "../../components/common/CollectionBtnGroup";
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
import { TransactionErrorhandle } from "../../utils/TransactionErrorhandle";
import { CurrencyType } from "../../types";

const CreateInCollection = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [displayDescription, setDisplayDescription] = useState<string>("");
  const [attributes, setAttributes] = useState<
    { trait: string; value: string }[]
  >([]);
  const [royaltyNFT, setRoyaltyNFT] = useState<number>(0);
  const [image, setImage] = useState<FileObject | null>(null);
  const [isShowAll, setIsShowAll] = useState<boolean>(false);

  const [collections, setCollections] = useState<CollectionProps[] | null>(
    null
  );
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionProps | null>(null);

  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] =
    useState<boolean>(false);
  const [isSelectCollectionModalOpen, setIsSelectCollectionModalOpen] =
    useState<boolean>(false);

  const [confirmedCollectionAddress, setConfirmedCollectionAddress] = useState<
    string | null
  >(null);
  const [collectionCreatedFlag, setCollectionCreatedFlag] =
    useState<boolean>(false);

  const [isCollectionProcessing, setIsCollectionProcessing] =
    useState<boolean>(false);
  const [isNFTProcessing, setIsNFTProcessing] = useState<boolean>(false);

  const { signer, wsProvider } = useContract();
  const { address, chain } = useAccount();

  const walletAddress = address as string;
  const [collectionContract, setCollectionContract] =
    useState<ethers.Contract | null>(null);
  // let wsCollectionContract: ethers.Contract | null = null;

  // Form validation check for required fields
  const validatorForm = () => {
    if (!displayName || !displayDescription) {
      notify("Please complete input field", "warning");
      return false;
    }
    return true;
  };

  // Filter attributes to ensure trait and value are not empty
  const formatAttributes = () => {
    return attributes.filter((log) => log.trait && log.value);
  };

  // Handle addition of a new attribute input
  const handleAddAttribute = () => {
    setAttributes([...attributes, { trait: "", value: "" }]);
  };

  // Update a specific attribute field (trait or value)
  const handleAttributeChange = (
    index: number,
    field: "trait" | "value",
    newValue: string
  ) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === index ? { ...attr, [field]: newValue } : attr
      )
    );
  };

  // Remove an attribute from the list
  const handleRemoveAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle royalty input and ensure valid percentage
  const handleRoyaltyChange = (percent: string) => {
    const _percent = Number(percent);
    if (isNaN(_percent)) {
      notify("Please input number as royalty", "warning");
      return;
    }
    if (_percent > 50) {
      notify("Please input number less then 50", "warning");
      return;
    }
    setRoyaltyNFT(_percent);
  };

  // Open the modal to create a new collection
  const handleOpenCollectionModal = async () => {
    setIsCreateCollectionModalOpen(true);
  };

  // Mint the NFT and upload metadata to IPFS
  const handleClickMint = async () => {
    if (!validatorForm) return;

    if (!walletAddress || !signer || !wsProvider) {
      notify("Please check wallet connection", "warning");
      return;
    }

    const currency = chain?.nativeCurrency.symbol ?? "";
    if (!CurrencyType.includes(currency)) {
      notify("Please select correct currency");
      return;
    }

    if (!confirmedCollectionAddress || !collectionContract) {
      notify("Please select collection", "warning");
      return;
    }
    if (!image) {
      notify("Please input image", "warning");
      return;
    }

    setIsNFTProcessing(true);

    const _attributes = formatAttributes();
    try {
      // Upload images to IPFS
      const uploadLogoImage = await pinata.upload.public.file(image);
      const imageURL = await pinata.gateways.public.convert(
        uploadLogoImage.cid
      );

      // Create metadata JSON and upload to IPFS
      const metadata: NFTMetaData = {
        name: displayName,
        description: displayDescription,
        image: imageURL,
      };
      if (attributes.length > 0) {
        metadata.attributes = _attributes;
      }
      const metadataUpload = await pinata.upload.public.json(metadata);
      const metadataURI = await pinata.gateways.public.convert(
        metadataUpload.cid
      );

      // Estimate the gas required for the transaction
      const gasEstimate = await collectionContract.mintNFT.estimateGas(
        walletAddress,
        metadataURI,
        royaltyNFT,
        currency
      );

      // Mint the NFT on the blockchain
      const tx = await collectionContract.mintNFT(
        walletAddress,
        metadataURI,
        royaltyNFT,
        currency,
        {
          gasLimit: gasEstimate,
        }
      );

      const { logs } = await tx.wait();
      const tokenIdBigInt = logs[0].args[2]; // Extract token ID (BigInt)
      const tokenId = Number(tokenIdBigInt); // Convert BigInt to a normal number

      await handleMintNFTDB(
        walletAddress,
        tokenId,
        metadataURI,
        royaltyNFT,
        confirmedCollectionAddress,
        currency
      );

      notify("NFT minted successfully", "success");

      // init form
      setDisplayName("");
      setDisplayDescription("");
      setRoyaltyNFT(0);
      setAttributes([]);
      setImage(null);
    } catch (error: any) {
      TransactionErrorhandle(error);
    } finally {
      setIsNFTProcessing(false);
    }
  };

  const handleMintNFTDB = async (
    owner: string,
    _tokenId: number,
    tokenURI: string,
    _royalty: number,
    collection: string,
    currency: string
  ) => {
    console.log(currency, "currency");
    try {
      const _nftData = {
        owner,
        tokenId: Number(_tokenId),
        tokenURI,
        royalty: Number(_royalty),
        collection,
        currency,
      };
      await mintNFTDB(_nftData);
    } catch (error) {
      console.log("Create NFTDB data occur error", error);
    }
  };

  // Fetch and setup contract instances when the collection address is confirmed
  useEffect(() => {
    if (!confirmedCollectionAddress) return;

    const contractInstance = new ethers.Contract(
      confirmedCollectionAddress,
      ContractCollectionABI,
      signer
    );
    setCollectionContract(contractInstance);

    // if (wsCollectionContract)
    //   wsCollectionContract.off("NFTMinted", handleMintNFTDB);

    // wsCollectionContract = new ethers.Contract(
    //   confirmedCollectionAddress,
    //   ContractCollectionABI,
    //   wsProvider
    // );

    // wsCollectionContract.on("NFTMinted", handleMintNFTDB);

    // return () => {
    //   if (wsCollectionContract)
    //     wsCollectionContract.off("NFTMinted", handleMintNFTDB);
    // };
  }, [confirmedCollectionAddress, wsProvider, signer, ContractCollectionABI]);

  // Fetch user's collections when wallet address changes
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
    };

    fetchCollections();
  }, [walletAddress, collectionCreatedFlag]);

  // Set up event listener for "NFTMinted" event and store NFT data in DB
  // useEffect(() => {
  //   if (!wsCollectionContract) return;

  //   // Attach event listener to the contract
  //   wsCollectionContract.on("NFTMinted", handleMintNFTDB);
  // }, [wsCollectionContract]);

  return (
    <div className="mb-8">
      <ToastContainer theme="dark" />
      <div className="w-full grid md:grid-cols-2 grid-cols-1 md:gap-10 gap-4 md:pb-0">
        <div className="md:hidden block">
          <h2 className="text-white lg:text-2xl text-xl font-semibold">
            Create an NFT in a Collection
          </h2>

          {/* Display Name */}
          <div className="mt-4">
            <h3 className="text-white font-semibold text-base md:text-lg mb-2">
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
          <div className="mt-4">
            <TextArea
              label="Description"
              placeholder="Describe the idea behind your NFT and explain how it stands out from the rest."
              value={displayDescription}
              onChange={(_value) => setDisplayDescription(_value)}
            />
          </div>
        </div>
        {/* Left section for NFT Banner */}
        <NFTBanner setImage={setImage} image={image} />

        {/* Right section for NFT Creation Form */}
        <div className="flex flex-col justify-between">
          <div className="md:block hidden">
            <h2 className="text-white lg:text-2xl text-xl font-semibold">
              Create an NFT in a Collection
            </h2>

            {/* Display Name */}
            <div className="mt-4">
              <h3 className="text-white font-semibold text-base md:text-lg mb-2">
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
            <div className="mt-4">
              <TextArea
                label="Description"
                placeholder="Describe the idea behind your NFT and explain how it stands out from the rest."
                value={displayDescription}
                onChange={(_value) => setDisplayDescription(_value)}
              />
            </div>
          </div>

          {/* Collection Modal Trigger */}
          <div className="mt-4 p-4 rounded-xl bg-[#1F1F21]">
            <div className="flex justify-between">
              <h3 className="text-white font-semibold text-base md:text-lg">
                Collection
              </h3>
              <div
                className="text-white text-xs font-bold flex items-center cursor-pointer"
                onClick={(_) => setIsShowAll(!isShowAll)}
              >
                <p>{!isShowAll ? "Show All" : "View less"}</p>
                <FaAngleDown
                  className={`ms-2 transition-transform duration-300 ease-in-out ${
                    isShowAll ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
            <div
              className={`mt-2 gap-4 flex flex-wrap max-w-full overflow-hidden ${
                isShowAll ? "" : "h-32"
              } ${
                !isCollectionProcessing && !collections?.length ? "hidden" : ""
              }`}
            >
              {isCollectionProcessing && (
                <ThreeDot color="#fff" size="medium" />
              )}
              {collections && (
                <CollectionBtnGroup
                  collections={collections}
                  setSelectedCollection={setSelectedCollection}
                  setIsProcessing={setIsCollectionProcessing}
                  setIsSelectCollectionModalOpen={
                    setIsSelectCollectionModalOpen
                  }
                  confirmedCollectionAddress={confirmedCollectionAddress}
                />
              )}
            </div>
            {/* Button Group in Horizontal Row */}
            {!isCollectionProcessing && (
              <button
                onClick={handleOpenCollectionModal}
                className="mt-4 relative w-32 h-32 bg-white text-black font-bold border-4 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:bg-gray-100"
              >
                {/* Plus Sign that Grows on Hover */}
                <span className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-black group-hover:scale-125 transition-all duration-300 transform">
                  +
                </span>

                {/* Border */}
                <span className="absolute inset-0 border-8 border-transparent rounded-lg"></span>
              </button>
            )}
          </div>

          {/* Royalties */}
          <div className="mt-4">
            <h3 className="text-white font-semibold text-base md:text-lg mb-2">
              Royalties for the Creator
            </h3>
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
            <h3 className="text-white font-semibold text-base md:text-lg">
              Attributes
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="mt-2">
              <Button
                type="outline"
                label="Add attribute"
                onClick={handleAddAttribute}
              />
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
          <Button
            type="blue"
            label="Create NFT"
            onClick={handleClickMint}
            disabled={isNFTProcessing}
          />
        </div>

        {/* Modal for Collection Creation */}
        <CreateCollectionModal
          isOpen={isCreateCollectionModalOpen}
          onClose={() => setIsCreateCollectionModalOpen(false)}
          setCreated={setCollectionCreatedFlag}
        />

        {/* Modal for Select Collection */}
        {selectedCollection && (
          <CollectionSelectModal
            isOpen={isSelectCollectionModalOpen}
            onClose={() => setIsSelectCollectionModalOpen(false)}
            collection={selectedCollection}
            setConfirmedCollectionAddress={setConfirmedCollectionAddress}
          />
        )}
      </div>
    </div>
  );
};

export default CreateInCollection;

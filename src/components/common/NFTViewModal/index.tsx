import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ethers } from "ethers";

import { ContractCollectionABI } from "../../../contracts";
import Modal from "../Modal";
import InputField from "../InputField";
import { notify } from "../Notify";

import { useContract } from "../../../context/ContractContext";
import { formatDate } from "../../../utils/FormatDate";
import { NFTMetaData, NFTProps } from "../../../types";
import { setNFTPrice } from "../../../services/nftService";

interface NFTViewModalProps {
    nftMetaData: NFTMetaData | null,
    nftProps: NFTProps,
    isOpen: boolean,
    onClose: () => void
}

interface DurationProp {
    date: number,
    hour: number,
    minute: number
}

export const NFTViewModal = ({ nftMetaData, nftProps, isOpen, onClose }: NFTViewModalProps) => {
    const [priceType, setPriceType] = useState<"fixed" | "auction">("fixed");
    const [price, setPrice] = useState<number>(0);
    const [duration, setDuration] = useState<DurationProp>({
        date: 0,
        hour: 0,
        minute: 0
    });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const { signer, wsProvider } = useContract();
    const [collectionContract, setCollectionContract] = useState<ethers.Contract | null>(null);
    const [wsCollectionContract, setWsCollectionContract] = useState<ethers.Contract | null>(null);

    const handleChangePrice = (evt: any) => {
        const { value } = evt.target;
        const _price = Number(value);
        if (isNaN(_price)) {
            notify("Please input number as price", "warning");
            return;
        }
        setPrice(_price);
    }

    const handleChangeDuration = (evt:any) => {
        const { name, value } = evt.target;
        setDuration((prev: DurationProp) => ({
            ...prev,
            [name]: value
        }))
    }

    const confirmPrice = async () => {
        //
        setIsProcessing(true);

        try {
            if ( priceType === "auction" ) {
                const auctionDuration = (new Date(0, 0, duration.date, duration.hour, duration.minute).getTime()) / 1000;
            }
            //
            if ( priceType === "fixed") {
                if (!collectionContract) {
                    notify("Please check wallet connection");
                    return;
                }
                const tokenId = nftProps.tokenId;

                const gasEstimate = await collectionContract.setTokenPrice.estimateGas(
                    tokenId,
                    price
                )

                const tx = await collectionContract.setTokenPrice(tokenId, price, { 
                    gasLimit: gasEstimate 
                });

                await tx.wait();
                notify("Set price successfully", "success");
                onClose();
            }   
        } catch (error: any) {
            if (error.code === "ACTION_REJECTED") {
              notify("Transaction rejected.", "warning");
            } else {
              console.error("Error mint NFT:", error);
              notify("Error occured on mint NFT", "error");
            }
          } finally {
            setIsProcessing(false);
          }
    }

    useEffect(() => {
        const collectionAddress = nftProps.collection?.contractAddress;
        if (!collectionAddress) {
            notify("Invalid Collection", "error");
            return;
        }

        const contractInstance = new ethers.Contract(collectionAddress, ContractCollectionABI, signer);
        setCollectionContract(contractInstance);

        const _wsContractInstance =  new ethers.Contract(collectionAddress, ContractCollectionABI, wsProvider);
        setWsCollectionContract(_wsContractInstance);
    }, [signer, wsProvider]);

    useEffect(() => {
        if (!wsCollectionContract) {
            console.log("ws not ready")
            return
        };

        const handleMintNFTDB = async (
            _tokenId: number,
            _price: number
        ) => {
            console.log("Try on DB")
            try {
                const price = Number(_price);
                const tokenId = Number(_tokenId);
                const _id = nftProps._id;
                const _nftData = { _id, tokenId, price };
                
                await setNFTPrice(_nftData);
            } catch (error) {
                console.log("Set NFT Price occur error", error)
            }
        }
  
        try {
            // Attach event listener to the contract
            console.log("ws listener")
            wsCollectionContract.on("NFTPriceSet", handleMintNFTDB);
        } catch (error) {
            console.error("Error setting up event listener:", error);
        }
    }, [wsCollectionContract])

    return (
        <Modal
            title="View NFT Token"
            isOpen={isOpen}
            onClose={onClose}
            btnLabel="Confirm"
            btnType="blue"
            btnClick={confirmPrice}
            btnProcessing={isProcessing}
        >
            <ToastContainer />
            
            <div className="text-white text-sm">
                <span className="font-bold">Address :</span> {nftProps.collection?._id}
            </div>

            <div className="mt-4 bg-black p-3 rounded-md">
                <span className="text-white font-semibold text-md mb-2">
                    Name : 
                </span>
                <span className="text-white ps-3">{nftMetaData?.name}</span>
            </div>
            <div className="py-4">
                <img src={nftMetaData?.image} alt={`${nftMetaData?.name} NFT image`} className="rounded-lg"/>
            </div>
            {/* symbol */}
            <div className="mt-4 bg-black p-3 rounded-md">
                <p className="text-white font-semibold text-md mb-2">
                    Description : 
                </p>
                <p className="text-white ps-3">{nftMetaData?.description}</p>
            </div>
            {
                nftProps.createdAt && (
                    <div className="mt-4 p-3 bg-black rounded-md">
                        <span className="text-white font-semibold text-md mb-2">
                            Created : 
                        </span>
                        <span className="text-white ps-3">{formatDate(nftProps?.createdAt)}</span>
                    </div>
                )
            }
            <form className="max-w-sm mx-auto mt-5 bg-black p-3 rounded-md">
              <label
                htmlFor="priceType"
                className="block mb-2 text-md font-semibold text-white"
              >
                Select Price Type
              </label>
              <select
                id="priceType"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as "fixed" | "auction" )}
                className="border text-sm rounded-lg block w-full p-2.5 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500"
              >
                <option value="fixed">Fixed</option>
                <option value="auction">Auction</option>
              </select>
              <div className="mb-4">
              {
                priceType === "fixed" && (
                    <div className="mt-3">
                        <div className="text-white mb-1 font-medium">Price</div>
                        <InputField 
                            itemType="default"
                            type="text"
                            name="price"
                            value={price}
                            onChange={handleChangePrice}
                        />
                    </div>
                )
              }
              {
                priceType === "auction" && (
                    <>
                        <div className="my-3">
                            <div className="text-white mb-1 font-medium">Start Bidding Price</div>
                            <InputField 
                                itemType="default"
                                type="text"
                                name="price"
                                value={price}
                                onChange={handleChangePrice}
                            />
                        </div>
                        <div className="text-white mb-1 font-medium">Auction Duration</div>
                        <div className="flex space-x-2 border-[#1F1F21] bg-[#1F1F21] text-white rounded-lg justify-between">
                            {/* Day Input */}
                            <input
                                type="number"
                                name="date"
                                value={duration.date}
                                onChange={handleChangeDuration}
                                placeholder="DD"
                                className="border rounded-l-lg p-2 text-sm text-center w-16 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500 "
                                maxLength={2}
                                min={1}
                                max={31}
                            />
                            {/* Hour Input */}
                            <input
                                type="number"
                                name="hour"
                                value={duration.hour}
                                onChange={handleChangeDuration}
                                placeholder="HH"
                                className="border-t border-b text-sm text-center w-16 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500 "
                                maxLength={2}
                                min={0}
                                max={23}
                            />
                            {/* Minute Input */}
                            <input
                                type="number"
                                name="minute"
                                value={duration.minute}
                                onChange={handleChangeDuration}
                                placeholder="MM"
                                className="border rounded-r-lg p-2 text-sm text-center w-16 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500 "
                                maxLength={2}
                                min={0}
                                max={59}
                            />
                        </div>
                    </>
                )
              }
              </div>
            </form>
        </Modal>
    )
}
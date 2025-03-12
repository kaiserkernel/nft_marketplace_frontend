import { useState, useEffect, ChangeEvent } from "react";
import { ToastContainer } from "react-toastify";
import { ethers } from "ethers";

import { ContractCollectionABI } from "../../../contracts";
import Modal from "../Modal";
import InputField from "../InputField";
import { notify } from "../Notify";

import { useContract } from "../../../context/ContractContext";
import { formatDate } from "../../../utils/FormatDate";
import { NFTMetaData, NFTProps } from "../../../types";
import { setNFTPriceDB } from "../../../services/nftService";

interface NFTViewModalProps {
    nftMetaData: NFTMetaData | null,
    nftProps: NFTProps,
    isOpen: boolean,
    onClose: () => void
}

interface DurationProp {
    date: number | null,
    hour: number | null,
    minute: number | null
}

export const NFTViewModal = ({ nftMetaData, nftProps, isOpen, onClose }: NFTViewModalProps) => {
    const [priceType, setPriceType] = useState<"fixed" | "auction">("fixed");
    const [price, setPrice] = useState<number>(0);
    const [duration, setDuration] = useState<DurationProp>({
        date: null,
        hour: null,
        minute: null
    });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const { signer, wsProvider } = useContract();
    const [collectionContract, setCollectionContract] = useState<ethers.Contract | null>(null);
    const [wsCollectionContract, setWsCollectionContract] = useState<ethers.Contract | null>(null);
    
    useEffect(() => {
        if (!isOpen) return;
        if (!nftProps.collection?.contractAddress) {
            notify("Invalid Collection", "error");
            return;
        }
        
        const contractInstance = new ethers.Contract(nftProps.collection.contractAddress, ContractCollectionABI, signer);
        setCollectionContract(contractInstance);

        const wsContractInstance = new ethers.Contract(nftProps.collection.contractAddress, ContractCollectionABI, wsProvider);
        setWsCollectionContract(wsContractInstance);
    }, [signer, wsProvider, nftProps.collection?.contractAddress, isOpen]);


    useEffect(() => {
        if (!wsCollectionContract || !isOpen) return;

        const handleNFTPriceSetDB = async (_tokenId: number, _price: number) => {
            try {
                await setNFTPriceDB({ _id: nftProps._id, tokenId: Number(_tokenId), price: Number(_price) });
            } catch (error) {
                console.error("Error setting NFT Price in DB", error);
            }
        };

        wsCollectionContract.on("NFTPriceSet", handleNFTPriceSetDB);
        return () => {
            wsCollectionContract.off("NFTPriceSet", handleNFTPriceSetDB);
        }
    }, [wsCollectionContract, nftProps._id, isOpen]);

    const handleChangePrice = (evt: ChangeEvent<HTMLInputElement>) => {
        const _price = Number(evt.target.value);
        if (isNaN(_price)) return notify("Please input a valid number for price", "warning");
        setPrice(_price);
    };

    const handleChangeDuration = (evt: ChangeEvent<HTMLInputElement>) => {
        setDuration((prev) => ({ ...prev, [evt.target.name]: Number(evt.target.value) }));
    };

    const confirmPrice = async () => {
        if (!collectionContract) return notify("Please check wallet connection");

        setIsProcessing(true);
        try {
            if ( priceType === "auction" ) {
                // const auctionDuration = (new Date(0, 0, duration.date, duration.hour, duration.minute).getTime()) / 1000;
            }
            
            if ( priceType === "fixed") {
                const gasEstimate = await collectionContract.setTokenPrice.estimateGas(nftProps.tokenId, price);
                const tx = await collectionContract.setTokenPrice(nftProps.tokenId, price, { gasLimit: gasEstimate });
                await tx.wait();
                notify("Price set successfully", "success");
                onClose();
            }   
        } catch (error: any) {
            notify(error.code === "ACTION_REJECTED" ? "Transaction rejected." : "Error occurred while setting NFT price", "error");
          } finally {
            setIsProcessing(false);
          }
    }

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
            <div className="mt-4 bg-black p-3 rounded-md text-white">
                <span className="font-semibold text-md mb-2">
                    Name : 
                </span>
                <span className="ps-3">{nftMetaData?.name}</span>
            </div>
            <div className="py-4">
                <img src={nftMetaData?.image} alt={`${nftMetaData?.name} NFT image`} className="rounded-lg"/>
            </div>
            <div className="mt-4 bg-black p-3 rounded-md text-white">
                <p className="font-semibold text-md mb-2">
                    Description : 
                </p>
                <p className="ps-3">{nftMetaData?.description}</p>
            </div>
            {
                nftProps.createdAt && (
                    <div className="mt-4 p-3 bg-black rounded-md text-white">
                        <span className="font-semibold text-md mb-2">
                            Created : 
                        </span>
                        <span className="ps-3">{formatDate(nftProps?.createdAt)}</span>
                    </div>
                )
            }
            <form className="max-w-sm mx-auto mt-5 bg-black p-3 rounded-md">
              <label htmlFor="priceType" className="block mb-2 text-md font-semibold text-white">
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
                priceType === "fixed" ? (
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
                ) : (
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
                            <input
                                type="number"
                                name="date"
                                value={duration.date ?? ""}
                                onChange={handleChangeDuration}
                                placeholder="DD"
                                className="border rounded-l-lg p-2 text-sm text-center w-16 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500 "
                                maxLength={2}
                                min={1}
                                max={31}
                            />
                            <input
                                type="number"
                                name="hour"
                                value={duration.hour ?? ""}
                                onChange={handleChangeDuration}
                                placeholder="HH"
                                className="border-t border-b text-sm text-center w-16 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500 "
                                maxLength={2}
                                min={0}
                                max={23}
                            />
                            <input
                                type="number"
                                name="minute"
                                value={duration.minute ?? ""}
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
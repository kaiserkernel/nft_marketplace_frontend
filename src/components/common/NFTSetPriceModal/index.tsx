import { useState, useEffect, ChangeEvent } from "react";
import { ToastContainer } from "react-toastify";
import { ethers } from "ethers";

import Modal from "../Modal";
import InputField from "../InputField";
import { notify } from "../Notify";

import { useContract } from "../../../context/ContractContext";
import { ContractCollectionABI } from "../../../contracts";
import { formatDate } from "../../../utils/FormatDate";
import { NFTMetaData, NFTProps } from "../../../types";
import { setNFTAuctionPriceDB, setNFTFixedPriceDB, setNFTNotForSaleDB } from "../../../services/nftService";
import { FormatToRealCurrency, FormatToWeiCurrency } from "../../../utils/FormatCurrency";
import { TransactionErrorhandle } from "../../../utils/TransactionErrorhandle";

interface NFTViewModalProps {
    nftMetaData: NFTMetaData | null,
    nftProps: NFTProps,
    isOpen: boolean,
    onClose: () => void,
    setNFTList: React.Dispatch<React.SetStateAction<NFTProps[]>>
}

interface DurationProp {
    date: number | null,
    hour: number | null,
    minute: number | null
}

export const NFTSetPriceModal = ({ nftMetaData, nftProps, isOpen, onClose, setNFTList }: NFTViewModalProps) => {
    const [priceType, setPriceType] = useState<"fixed" | "auction" | "not_for_sale">("fixed");
    const [priceCurrency, setPriceCurrency] = useState<"BNB" | "ETH">("BNB");
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
        if (!isOpen) {
            setPrice(0);
            setPriceType("fixed");
            setDuration({date: null, hour: null, minute: null});
            return;
        }
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

        wsCollectionContract.on("NFTPriceSet", handleNFTPriceSetDB);
        wsCollectionContract.on("AuctionStarted", handleNFTAuctionStartedDB);
        if (!isOpen) {
            return () => {
                wsCollectionContract.off("NFTPriceSet", handleNFTPriceSetDB);
                wsCollectionContract.off("AuctionStarted", handleNFTAuctionStartedDB);
            }
        }
    }, [wsCollectionContract, nftProps._id, isOpen]);

    const handleNFTAuctionStartedDB = async (tokenId: bigint, startingBid: bigint, auctionEndTime: bigint) => {
        try {
            // Convert values to readable format
            const formattedTokenId = Number(tokenId); // Convert BigInt to string
            const formattedBid = FormatToRealCurrency(Number(startingBid)); // Convert BigInt to string (wei)
            const formattedEndTime = Number(auctionEndTime); // Convert timestamp to ISO format
    
            // Define the request body
            const requestBody = {
                _id: nftProps._id,
                tokenId: formattedTokenId,
                startBid: formattedBid,
                bidEndDate: formattedEndTime
            };
            
            const { data } = await setNFTAuctionPriceDB(requestBody);
            
            // After price is set, update the NFT in the list
            setNFTList((prevNFTList) => {
                return prevNFTList.map((nft) => {
                    if (nft._id === data._id) {
                        return data; // Update the price of the matched NFT
                    }
                    return nft;
                });
            });
        } catch (error) {
            console.error("Error setting NFT Auction in DB", error);
        }
    }

    const handleNFTPriceSetDB = async (_tokenId: number, _price: BigInt) => {
        try {
            const realPrice = FormatToRealCurrency(Number(_price)); // convert from wei currency

            let data:NFTProps;
            if (realPrice) {
                const response = await setNFTFixedPriceDB({ _id: nftProps._id, tokenId: Number(_tokenId), price: realPrice });
                data = response.data;
            } else {
                const response = await setNFTNotForSaleDB({ _id: nftProps._id, tokenId: Number(_tokenId) });
                data = response.data;
            }
            
            // After price is set, update the NFT in the list
            setNFTList((prevNFTList) => {
                return prevNFTList.map((nft) => {
                    if (nft._id === data._id) {
                        return data; // Update the price of the matched NFT
                    }
                    return nft;
                });
            });
        } catch (error) {
            console.error("Error setting NFT Price in DB", error);
        }
    };

    const handleChangePrice = (evt: ChangeEvent<HTMLInputElement>) => {
        const value = evt.target.value;

        setPrice(Number(value)); // Convert to number, allow empty input
    };

    const handleChangeDuration = (evt: ChangeEvent<HTMLInputElement>) => {
        setDuration((prev) => ({ ...prev, [evt.target.name]: Number(evt.target.value) }));
    };

    const confirmPrice = async () => {
        if (!collectionContract) return notify("Please check wallet connection");

        setIsProcessing(true);
        try {
            if ( priceType === "auction" ) {
                if (!price || price <= 0) {
                    notify("Please set start bid price correctly", "warning");
                    return
                }
                if ( duration.date === null || duration.hour === null || duration.minute === null ) {
                    notify("Please complete duration field", "warning");
                    return
                }
                const totalSeconds = (duration.date * 24 * 60 * 60) + (duration.hour * 60 * 60) + (duration.minute * 60);
                
                if (totalSeconds <= 0) {
                    notify("Invalid auction duration", "warning");
                    return;
                }

                const auctionDuration = BigInt(totalSeconds);
                const tokenId = nftProps.tokenId;
                const startingBid = FormatToWeiCurrency(price); // Convert to wei

                const gasEstimate = await collectionContract.startAuction.estimateGas(tokenId, startingBid, auctionDuration);
                const tx = await collectionContract.startAuction(tokenId, startingBid, auctionDuration, { gasLimit: gasEstimate });
                const log = await tx.wait();
                
                // await handleNFTAuctionStartedDB(nftProps.tokenId, startingBid, )
                notify("Auction started successfully!", "success");
                onClose();
            }
            
            if ( priceType === "fixed") {
                if (price === null || price <= 0) {
                    notify("Please set price", "warning");
                    return
                }

                const _price = FormatToWeiCurrency(price); // Convert to BigInt and wei currency
                const gasEstimate = await collectionContract.setTokenPrice.estimateGas(nftProps.tokenId, _price);
                const tx = await collectionContract.setTokenPrice(nftProps.tokenId, _price, { gasLimit: gasEstimate });
                const log = await tx.wait();

                // await handleNFTPriceSetDB(nftProps.tokenId, _price);
                // log.logs[0].address -> contractAddress 
                // log.from -> owner address
                notify("Price set successfully", "success");
                setTimeout(() => onClose(), 1500)
            }

            if ( priceType === "not_for_sale") {
                const gasEstimate = await collectionContract.setTokenPrice.estimateGas(nftProps.tokenId, 0);
                const tx = await collectionContract.setTokenPrice(nftProps.tokenId, price, { gasLimit: gasEstimate });
                const log = await tx.wait();

                // await handleNFTPriceSetDB(nftProps.tokenId, 0);
                // log.logs[0].address -> contractAddress 
                // log.from -> owner address
                notify("Price set successfully", "success");
                onClose();
            }
        } catch (error: any) {
            TransactionErrorhandle(error);
          } finally {
            setIsProcessing(false);
          }
    }
    
    const NftPriceInfo:React.FC = () => (
        nftProps.priceType === "auction" ? (
            <>
                <div className="mt-4 p-3 bg-black rounded-md text-white">
                    <span className="font-semibold text-md mb-2">
                        Price Type : 
                    </span>
                    <span className="ps-3">Auction</span>
                </div>
                <div className="mt-4 p-3 bg-black rounded-md text-white">
                    <span className="font-semibold text-md mb-2">
                        Start Bid Price
                    </span>
                    <span className="ps-3">{nftProps.startBid}</span>
                </div>
                <div className="mt-4 p-3 bg-black rounded-md text-white">
                    <span className="font-semibold text-md mb-2">
                        Bid End Time
                    </span>
                    <span className="ps-3">{nftProps.bidEndDate && formatDate(nftProps.bidEndDate)}</span>
                </div>
            </>
        ) : (nftProps.priceType === "fixed" && nftProps.price) ? (
            <>
                <div className="mt-4 p-3 bg-black rounded-md text-white">
                    <span className="font-semibold text-md mb-2">
                        Price Type : 
                    </span>
                    <span className="ps-3">Fixed</span>
                </div>
                <div className="mt-4 p-3 bg-black rounded-md text-white">
                    <span className="font-semibold text-md mb-2">
                        Current Price : 
                    </span>
                    <span className="ps-3">{nftProps.price}</span>
                </div>
            </>
        ) : (nftProps.priceType === "not_for_sale") ? (
            <>
                <div className="mt-4 p-3 bg-black rounded-md text-white">
                    <span className="font-semibold text-md mb-2">
                        Not For Sale
                    </span>
                </div>
            </>
        ) : null
    )

    return (
        <Modal
            title="View NFT Token"
            isOpen={isOpen}
            onClose={onClose}
            btnLabel={priceType === "auction" ? "Start Auction" : "Confirm"}
            btnType="blue"
            btnClick={confirmPrice}
            btnProcessing={isProcessing}
        >
            <ToastContainer  toastStyle={{ backgroundColor: "black" }}  />
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
            <NftPriceInfo />
            <form className="mx-auto mt-5 bg-black p-3 rounded-md">
              <label htmlFor="priceType" className="block mb-2 text-md font-semibold text-white mt-2">
                Select Price Type
              </label>
              <select
                id="priceType"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as "fixed" | "auction" | "not_for_sale")}
                className="border text-sm rounded-lg block w-full p-2.5 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500"
              >
                <option value="fixed">Fixed</option>
                <option value="auction">Auction</option>
                <option value="not_for_sale">Not for sale</option>
              </select>
              {
                priceType !== "not_for_sale" && (
                    <>
                        <label htmlFor="priceCurrency" className="block mb-2 text-md font-semibold text-white mt-2">
                            Select Price Currency
                        </label>
                        <select
                            id="priceCurreny"
                            value={priceCurrency}
                            onChange={(e) => setPriceCurrency(e.target.value as "BNB" | "ETH")}
                            className="border text-sm rounded-lg block w-full p-2.5 border-[#1F1F21] bg-[#1F1F21] text-white focus:ring-blue-500"
                        >
                            <option value="BNB">BNB</option>
                            <option value="ETH">ETH</option>
                        </select>
                    </>
                )
              }
              <div className="mb-4">
              {
                priceType === "fixed" ? (
                    <div className="mt-3">
                        <div className="text-white mb-1 font-medium">Price</div>
                        <InputField 
                            itemType="default"
                            type="number"
                            name="price"
                            value={price}
                            onChange={handleChangePrice}
                        />
                    </div>
                ) : priceType === "auction" ? (
                    <>
                        <div className="my-3">
                            <div className="text-white mb-1 font-medium">Start Bidding Price</div>
                            <InputField 
                                itemType="default"
                                type="number"
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
                ) : null
              }
              </div>
            </form>
        </Modal>
    )
}
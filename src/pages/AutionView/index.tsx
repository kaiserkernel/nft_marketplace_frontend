import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";
import { ThreeDot } from "react-loading-indicators";

import { useContract } from "../../context/ContractContext";
import { ContractCollectionABI } from "../../contracts";
import { formatDate } from "../../utils/FormatDate";
import { NFTProps } from "../../types";
import { auctionEnded, bidToAuctionDB, fetchNFTAuctionInfo } from "../../services/nftService";
import { FormatAddress } from "../../utils/FormatAddress";
import { FormatToWeiCurrency } from "../../utils/FormatToWeiCurrency";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import InputField from "../../components/common/InputField";
import { notify } from "../../components/common/Notify";

const AuctionView:React.FC = () => {
    const location = useLocation();
    const nft : NFTProps = location.state || {};

    const [nftData, setNftData] = useState<NFTProps>(nft);
    const [imageLoading, setImageLoading] = useState<boolean>(true);
    const [bidPrice, setBidPrice] = useState<number>(0);
    const [openBidModal, setOpenBidModal] = useState<boolean>(false);
    const [isProcessing, setIsProcessing ] = useState<boolean>(false);

    const { walletAddress, signer, wsProvider } = useContract();
    const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);
    
    const topBidPrice = useMemo(() => {
        if (!nft.bidHistory?.length) {
            return nft.startBid;
        }
        const highestBid = nft.bidHistory?.slice().sort((a, b) => b.price - a.price)[0];
        return highestBid.price;
    }, [nft])
    
    const handlePlaceBidNft = async () => {
        if (!contractInstance) return;
        if (!bidPrice) {
            notify("Please set bid price", "warning");
            return;
        }
        if (topBidPrice && bidPrice < topBidPrice) {
            notify("Bid price should be greater then top bid price", "warning");
            return;
        }

        setIsProcessing(true);
        const _realPrice = FormatToWeiCurrency(bidPrice);
        try {
            const gasEstimate = await contractInstance.placeBid.estimateGas( nft.tokenId, {
                value: _realPrice
            } );
            
            // Mint the NFT on the blockchain
            const tx = await contractInstance.placeBid( nft.tokenId, { 
                gasLimit: gasEstimate,
                value: _realPrice
            });
        
            const log = await tx.wait();
            console.log(log, 'log')
            // log.logs[0].address -> contractAddress 
            // log.from -> owner address
            notify("Bid NFT successfully", "success");
            handleCloseBidNftModal();
        } catch (error: any) {
            if (error.code === "ACTION_REJECTED") {
                return;
            }
        
            console.log(error, 'error')
            // Extract error reason
            let errorMessage = "Transaction failed. Please try again.";
        
            if (error.reason) {
                errorMessage = error.reason; // Standard Ethers.js error message
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message; // Metamask error message
            } else if (error.message) {
                errorMessage = error.message;
            }
        
            notify(errorMessage, "error");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleAuctionEnded = async (winner: string, tokenId:bigint, winningBid: bigint) => {
        const _tokenId = Number(tokenId);
        const _realWinningBid = Number(winningBid) / (10 ** 18);

        try {
            const requestBody = {
                _id: nftData._id,
                winner,
                tokenId: _tokenId,
                winningBid: _realWinningBid
            }

            await auctionEnded(requestBody);
        } catch (error) {
            console.log(error, "Auction ended on DB error");
        }
    }

    const handleClickEndAuction = async () => {
        if (!contractInstance) return;
        
        try {
            const gasEstimate = await contractInstance.endAuction.estimateGas( nft.tokenId);
            
            // Mint the NFT on the blockchain
            const tx = await contractInstance.endAuction( nft.tokenId, { 
                gasLimit: gasEstimate
            });
        
            const log = await tx.wait();
        } catch (error: any) {
            if (error.code === "ACTION_REJECTED") {
                return;
            }
            console.error("Place bid error:", error);
        
            // Extract error reason
            let errorMessage = "Transaction failed. Please try again.";
        
            if (error.reason) {
                errorMessage = error.reason; // Standard Ethers.js error message
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message; // Metamask error message
            } else if (error.message) {
                errorMessage = error.message;
            }
        
            notify(errorMessage, "error");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleBidNFTDB = async (bidder: string, tokenId: bigint, bidAmount: bigint) => {
        const _realPrice = Number(bidAmount) / (10 ** 18);

        try {
            await bidToAuctionDB({_id: nft._id, bidder, tokenId: Number(tokenId), bidAmount: _realPrice})
        } catch (error) {
            console.log(error, "Bid NFT Error")
        }
    }

    const handleOpenBidNftModal = () => {
        setOpenBidModal(true);
    }

    const handleCloseBidNftModal = () => {
        setOpenBidModal(false);
    }
    
    // Fetch and setup contract instances when the collection address is confirmed
    useEffect(() => {
        if (!nftData.collection?.contractAddress || !wsProvider || !signer) {
            // notify("Please check out wallet connection", "error");
            return;
        }
        
        let wsInstance:ethers.Contract ;
        try {
            const contractInstance = new ethers.Contract(nftData.collection.contractAddress, ContractCollectionABI, signer);
            setContractInstance(contractInstance);
    
            wsInstance = new ethers.Contract(nftData.collection.contractAddress, ContractCollectionABI, wsProvider);
            wsInstance.on("NewBidPlaced", handleBidNFTDB);
            wsInstance.on("AuctionEnded", handleAuctionEnded);

        } catch (error) {
            console.log(error, "error")
        }
        
        return () => {
            wsInstance.off("NewBidPlaced", handleBidNFTDB);
            wsInstance.off("AuctionEnded", handleAuctionEnded);
        }
    }, [wsProvider, signer, ContractCollectionABI, nftData.collection?.contractAddress])

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const { data } = await fetchNFTAuctionInfo({_id: nft._id});
                console.log(data, "data")
                setNftData(data);
            } catch (error) {
                console.error("Error fetch address:", error)
            }
        }
        fetchAddress();
    }, [nft]);

    return (
        <>
            <ToastContainer />
            <div className="w-full grid md:grid-cols-2 grid-cols-1 mb-8 md:mb-16">
                <div className="md:mr-8">
                    {
                        !nftData.image ? (
                            <ThreeDot color="#fff" size="large"/>
                        ) : (
                            <img src={nftData.image} className="border border-4 rounded-2xl"/>
                        )
                    }
                    <div className="text-white py-4 rounded-lg bg-[#1B1B1B] md:mt-8 mt-4">
                        <h1 className="md:ps-8 ps-4 text-white text-xl font-bold pb-4">Description</h1>
                        <hr className="border-gray-600 py-2"/>
                        <p className="md:ps-8 ps-4">{nftData.description}</p>
                    </div>
                </div>
                <div className="text-white md:mt-0 mt-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-semibold md:mt-0 mt-4 mb-2">{nftData.name} #{nftData.tokenId}</h1>
                        {(nftData.owner.toLowerCase() === walletAddress) && <Button label="End Auction" type="blue" onClick={handleClickEndAuction}/>}
                    </div>
                    <div className="bg-[#1B1B1B] rounded-lg border border-gray-900 md:mt-4 md:py-5 py-3">
                        <p className="pb-3 md:ps-8 ps-4 font-medium">{nftData.bidEndDate && `Sale ends ${formatDate(nftData.bidEndDate)}`}</p>
                        <hr className="border-gray-600 py-2"/>
                        <div className="md:ps-8 ps-4">
                            <p className="text-sm text-gray-300 font-medium py-2">Start bid</p>
                            <p className="text-white text-2xl font-bold pb-2">{nftData.startBid}ETH</p>
                            <Button type="blue" label="Place Bid" onClick={handleOpenBidNftModal}/>
                        </div>
                    </div>
                    <div className="md:mt-10 mt-4 bg-[#1B1B1B] rounded-lg border border-gray-900 md:mt-4 md:py-5 py-3">
                        <p className="pb-3 md:ps-8 ps-4 font-medium text-lg">Bid History</p>
                        <hr className="border-gray-600 py-2"/>
                        {
                            (!!nftData.bidHistory?.length) ? nftData.bidHistory.map((log, idx) => {
                                return (
                                    <div key={idx} className="md:ps-8 ps-4 mb-3">
                                        <div className="grid grid-cols-9">
                                            <p className="col-span-2">{log.price}</p>
                                            <p className="col-span-3">{formatDate(log.date)}</p>
                                            <p className="col-span-4">{FormatAddress(log.bidder)}</p>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <p className="text-white font-bold text-xl md:ps-8 ps-4">
                                    No Bid
                                </p>
                            )
                        }
                    </div>
                    <Modal
                        isOpen={openBidModal}
                        onClose={handleCloseBidNftModal}
                        title="Place Bid"
                        btnLabel="Confirm"
                        btnType="blue"
                        btnClick={handlePlaceBidNft}
                        size="small"
                        btnProcessing={isProcessing}
                    >
                        <div className="md:my-5 my-3 bg-black p-3 rounded-md">
                            <span className="text-base font-bold">
                                Bid End Time: {nftData.bidEndDate && formatDate(nftData.bidEndDate)}
                            </span>
                        </div>
                        <div className="md:my-5 my-3 bg-black p-3 rounded-md">
                            <span className="text-base font-bold">
                                Top Bid Price: 
                            </span>
                            <span className="ps-4">
                                {topBidPrice}
                            </span>
                        </div>
                        <div className="p-3 rounded-md bg-black">
                            <p className="text-base font-bold md:my-4 my-3">
                                Please input bid amount
                            </p>
                            <InputField 
                                name="price"
                                value={bidPrice}
                                type="number"
                                itemType="default"
                                onChange={(evt) => setBidPrice(Number(evt.target.value))}
                            />
                        </div>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default AuctionView;
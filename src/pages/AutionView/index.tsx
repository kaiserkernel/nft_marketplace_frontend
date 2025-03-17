import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { ethers } from "ethers";

import { useContract } from "../../context/ContractContext";
import { ContractCollectionABI } from "../../contracts";

import { NFTProps } from "../../types";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatDate } from "../../utils/FormatDate";

const AuctionView = () => {
    const location = useLocation();
    const nft : NFTProps = location.state || {};
console.log(nft, "nft nft auction auction")
    const [bidPrice, setBidPrice] = useState<number | null>(null);
    const [openBidModal, setOpenBidModal] = useState<boolean>(false);

    const { walletAddress, signer, wsProvider } = useContract();
    const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);
    const [wsContractInstance, setWsContractInstance] = useState<ethers.Contract | null>(null);

    const topBidPrice = useMemo(() => {
        if (!nft.bidHistory?.length) {
            return nft.startBid;
        }
        const highestBid = nft.bidHistory?.slice().sort((a, b) => b.price - a.price)[0];
        return highestBid;
    }, [nft])

    const handlePlaceBidNft = async () => {
        if (!contractInstance) return;
        try {
            const estimateGas = await contractInstance.placeBid.estimateGas( nft.tokenId, {
                // value
            } )
        } catch (error) {
            
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
        if (!walletAddress) {
            // notify("Please check out wallet connection", "error");
            return;
        }

        const contractInstance = new ethers.Contract(walletAddress, ContractCollectionABI, signer);
        setContractInstance(contractInstance);

        const _wsContractInstance =  new ethers.Contract(walletAddress, ContractCollectionABI, wsProvider);
        setWsContractInstance(_wsContractInstance);
    }, [walletAddress, wsProvider, signer, ContractCollectionABI])
    

    return (
        <div className="w-full grid md:grid-cols-2 grid-cols-1 mb-8 md:mb-16">
            <div className="md:mr-8">
                <img src={nft.image} className="border border-4 rounded-2xl"/>
                <div className="text-white py-4 rounded-lg bg-[#1B1B1B] md:mt-8 mt-4">
                    <h1 className="md:ps-8 ps-4 text-white text-xl font-bold pb-4">Description</h1>
                    <hr className="border-gray-600 py-2"/>
                    <p className="md:ps-8 ps-4">{nft.description}</p>
                </div>
            </div>
            <div className="text-white">
                <h1 className="text-2xl font-semibold">{nft.name} #{nft.tokenId}</h1>
                <div className="bg-[#1B1B1B] rounded-lg border border-gray-900 md:mt-4 md:py-5 py-3">
                    <p className="pb-3 md:ps-8 ps-4 font-medium">{nft.bidEndDate && `Sale ends ${formatDate(nft.bidEndDate)}`}</p>
                    <hr className="border-gray-600 py-2"/>
                    <div className="md:ps-8 ps-4">
                        <p className="text-sm text-gray-300 font-medium py-2">Start bid</p>
                        <p className="text-white text-2xl font-bold pb-2">{nft.startBid}ETH</p>
                        <Button type="blue" label="Place Bid" onClick={handleOpenBidNftModal}/>
                    </div>
                </div>
                <div className="md:mt-10 mt-4 bg-[#1B1B1B] rounded-lg border border-gray-900 md:mt-4 md:py-5 py-3">
                    <p className="pb-3 md:ps-8 ps-4 font-medium text-lg">Bid History</p>
                    <hr className="border-gray-600 py-2"/>
                    {
                        (!!nft.bidHistory?.length) ? nft.bidHistory.map(log => {
                            return (
                                <>
                                    {log.price}
                                </>
                            )
                        }) : (
                            <p className="text-white font-bold text-xl md:ps-8 ps-4 ">
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
                >

                </Modal>
            </div>
        </div>
    )
}

export default AuctionView;
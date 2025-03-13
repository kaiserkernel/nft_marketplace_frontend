import React, { useEffect, useState } from "react"
import { ethers } from "ethers";
import { ThreeDot } from "react-loading-indicators";

import { NFTMetaData, NFTProps } from "../../../types"
import { fetchMetaData } from "../../../services/metaDataService";
import { notify } from "../Notify";

import { useContract } from "../../../context/ContractContext";
import { buyNFT } from "../../../services/nftService";
import { ContractCollectionABI } from "../../../contracts";

interface NFTViewBtnProps {
    nftData: NFTProps,
    setNFTList: React.Dispatch<React.SetStateAction<NFTProps[]>>
}

export const NFTViewBtn = ({nftData, setNFTList}: NFTViewBtnProps) => {
    const { price, tokenURI, lastPrice } = nftData;
    const [nftMetaData, setNFTMetaData] = useState<NFTMetaData | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const { walletAddress, signer, wsProvider } = useContract();
    const [collectionContract, setCollectionContract] = useState<ethers.Contract | null>(null);
    const [wsCollectionContract, setWsCollectionContract] = useState<ethers.Contract | null>(null);

    const handleBuyNft = async () => {
        if (!price) return;
        if (!collectionContract) {
            notify("Please check out wallect connection", "error")
            return;
        }

        setIsProcessing(true);

        try {
            // Estimate the gas required for the transaction
            const gasEstimate = await collectionContract.mintNFT.estimateGas( nftData.tokenId );
            
            // Mint the NFT on the blockchain
            const tx = await collectionContract.mintNFT( nftData.tokenId, { 
                gasLimit: gasEstimate 
            });
        
            const log = await tx.wait();
        
            // log.logs[0].address -> contractAddress 
            // log.from -> owner address
            notify("Buy NFT successfully", "success");
        } catch (error: any) {
            notify(error.code === "ACTION_REJECTED" ? "Transaction rejected." : "Error occured on mint NFT", "error");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleSavebuyNFTDB = async (
        owner: string,
        _tokenId: number,
        _price: number
    ) => {
        try {
            const _buyData = { _id: nftData._id, owner, tokenId: Number(_tokenId), price: Number(_price)};
            await buyNFT(_buyData);
            
            // Update nft list
            setNFTList((prevNFTList) => {
                return prevNFTList.map((nft) => {
                    if (nft.tokenId === _tokenId) {
                        return { ...nft, price: 0, lastPrice: _price }; // Update the price of the matched NFT
                    }
                    return nft;
                });
            });
        } catch (error) {
            console.log("Log NFT Buy data occur error", error)
        }
    }

    useEffect(() => {
        const fetchNFTData = async () => {
            try {
                const { data } = await fetchMetaData(tokenURI);
                setNFTMetaData(data);
            } catch (error) {
                console.log(error, "Fetch initial nft data occur error");
            }
        }
        fetchNFTData();
    }, [tokenURI])

    // Fetch and setup contract instances when the collection address is confirmed
    useEffect(() => {
        if (!walletAddress) {
            notify("Please check out wallet connection", "error");
            return;
        }

        const contractInstance = new ethers.Contract(walletAddress, ContractCollectionABI, signer);
        setCollectionContract(contractInstance);

        const _wsContractInstance =  new ethers.Contract(walletAddress, ContractCollectionABI, wsProvider);
        setWsCollectionContract(_wsContractInstance);
    }, [walletAddress, wsProvider, signer, ContractCollectionABI])

    useEffect(() => {
        if (!wsCollectionContract) return;
        
        // Attach event listener to the contract
        wsCollectionContract.on("NFTMinted", handleSavebuyNFTDB);

        return () => {
            wsCollectionContract.off("NFTMinted", handleSavebuyNFTDB);
        }
    }, [wsCollectionContract])

    return (
        <button
            // onClick={() => handleBtnClick(collection)}
            className="relative group"
        >
          {
              nftMetaData?.image && (
                <div className="relative w-full h-full group rounded-2xl border-4 border-white border-opacity-30 transition-all duration-500 hover:border-opacity-100 hover:shadow-lg">
                    {/* Image with Hover Blur Effect */}
                    <img 
                        src={nftMetaData.image} 
                        alt={nftMetaData.name} 
                        className="w-full h-full object-cover transition duration-300 group-hover:blur-sm w-[40vw] h-[40vw] md:w-64 md:h-64 rounded-t-xl"
                    />

                    {/* NFT Info */}
                    <div className="w-[40vw] md:w-64 flex flex-col text-white items-start">
                        <p className="md:text-sm text-xs font-light mt-3 ml-4">{nftMetaData.name}</p>
                        <p className={`md:text-base text-sm font-medium mt-2 ml-4 ${price === 0 ? 'text-blue-600' : ''}`}>
                            {price === 0 ? "Not for sale" : `${price}ETH`}
                        </p>
                        <p className="md:text-base text-white text-sm font-medium mt-2 ml-4 mb-4 group-hover:hidden">
                            Last Price: {lastPrice === 0 ? "" : `${lastPrice}ETH`}
                        </p>
                    </div>

                    {/* Button appears when hovering the entire component */}
                    <div 
                        className={`absolute bottom-0 left-0 w-full h-[2.5rem] flex justify-center items-center bg-blue-600 text-white text-sm font-medium rounded-b-md opacity-0 ${price !== 0 ? 'group-hover:opacity-100 group-hover:translate-y-0 group-hover:h-[2.5rem] transition-all duration-300' : ''} rounded-b-xl grid grid-cols-9`} 
                        onClick={handleBuyNft}
                    >
                        {
                            isProcessing ? <ThreeDot color="#fff" size="small"/> :  (
                                <>
                                    <span className="col-span-6 mx-auto font-bold">Buy Now</span>
                                    
                                    {/* <!-- Vertical white divider --> */}
                                    <div className="h-6 border-r-2 border-white mx-2"></div>
                                    
                                    {/* <!-- Image aligned to the right --> */}
                                    <img className="col-span-2 h-6 w-6 mx-auto" src="/buy.webp" />
                                </>
                            )
                        }
                    </div>


                </div>
              )
          }
      </button>
    )
}
import { useEffect, useState } from "react"
import { ThreeDot } from "react-loading-indicators";

import { NFTMetaData, NFTProps } from "../../../types"
import { fetchMetaData } from "../../../services/metaDataService";

interface NFTViewBtnProps {
    nftData: NFTProps,
    isProcessing: number | null,
    handleBuyNft: (price: number, tokenId: number) => Promise<void>
}

export const NFTViewBtn = ({nftData, isProcessing, handleBuyNft}: NFTViewBtnProps) => {
    const { price, tokenURI, lastPrice, tokenId } = nftData;
    const [nftMetaData, setNFTMetaData] = useState<NFTMetaData | null>(null);

    const handleClickBuyNft = async () => {
        if (!price || isProcessing) return;
        await handleBuyNft(price, tokenId);
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
                        className={`absolute bottom-0 left-0 w-full h-[2.5rem] flex justify-center items-center bg-blue-600 text-white text-sm font-medium rounded-b-md opacity-0 ${price === 0 ? "" : "group-hover:opacity-100 group-hover:translate-y-0 group-hover:h-[2.5rem] transition-all duration-300"} rounded-b-xl grid grid-cols-9 ${isProcessing === tokenId ? "opacity-100" : ""}`} 
                        onClick={handleClickBuyNft}
                    >
                        {
                            isProcessing === tokenId ? (
                                <div className="col-span-8">
                                    <ThreeDot color="#fff" size="small"/>
                                </div>
                            ) :  (
                                <>
                                    <span className="col-span-6 mx-auto font-bold">Buy Now</span>
                                    <div className="h-6 border-r-2 border-white mx-2"></div>
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
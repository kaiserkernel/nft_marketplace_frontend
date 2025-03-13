import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { NFTMetaData, NFTProps } from "../../../types"
import { fetchMetaData } from "../../../services/metaDataService";

export const NFTViewBtn = ({data}: {data: NFTProps}) => {
    const { price, tokenURI  } = data;
    const [nftData, setNFTData] = useState<NFTMetaData | null>(null);

    const handleBuyNft = () => {
        if (!price) return;
        console.log("mft")
        console.log(data, "data")
        console.log(nftData, "nftdata")
    }

    useEffect(() => {
        const fetchNFTData = async () => {
            try {
                const { data } = await fetchMetaData(tokenURI);
                setNFTData(data);
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
              nftData?.image && (
                <div className="relative w-full h-full group rounded-2xl border-4 border-white border-opacity-30 transition-all duration-500 hover:border-opacity-100 hover:shadow-lg">
                    {/* Image with Hover Blur Effect */}
                    <img 
                        src={nftData.image} 
                        alt={nftData.name} 
                        className="w-full h-full object-cover transition duration-300 group-hover:blur-sm w-[40vw] h-[40vw] md:w-64 md:h-64 rounded-t-xl"
                    />

                    {/* NFT Info */}
                    <div className="w-[40vw] md:w-64 flex flex-col text-white items-start">
                        <p className="md:text-sm text-xs font-light mt-3 ml-4">{nftData.name}</p>
                        <p className={`md:text-base text-sm font-medium mt-2 ml-4 pb-10 ${price === 0 ? 'text-blue-600' : ''}`}>
                            {price === 0 ? "Not for sale" : `${price}ETH`}
                        </p>
                    </div>

                    {/* Button appears when hovering the entire component */}
                    <div 
                        className={`absolute bottom-0 left-0 w-full h-[2.5rem] flex justify-center items-center bg-blue-600 text-white text-sm font-medium rounded-b-md opacity-0 ${price !== 0 ? 'group-hover:opacity-100 group-hover:translate-y-0 group-hover:h-[2.5rem] transition-all duration-300' : ''} rounded-b-xl grid grid-cols-9`} 
                        onClick={handleBuyNft}
                    >
                        <span className="col-span-6 mx-auto font-bold">Buy Now</span>
                        
                        {/* <!-- Vertical white divider --> */}
                        <div className="h-6 border-r-2 border-white mx-2"></div>
                        
                        {/* <!-- Image aligned to the right --> */}
                        <img className="col-span-2 h-6 w-6 mx-auto" src="/buy.webp" />
                    </div>


                </div>
              )
          }
      </button>
    )
}
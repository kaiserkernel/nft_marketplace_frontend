import React, { useEffect, useState } from "react"

import { NFTMetaData, NFTProps } from "../../../types"
import { fetchMetaData } from "../../../services/metaDataService";

export const NFTViewBtn = ({data}: {data: NFTProps}) => {
    const { price, tokenURI  } = data;
    const [nftData, setNFTData] = useState<NFTMetaData | null>(null);

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
            className="relative md:w-64 md:h-64 group w-[40vw] h-[40vw]"
        >
          {
              nftData?.image && (
                  <div className="relative w-full h-full group rounded-md border-4 border-white border-opacity-30 transition-all duration-500 hover:border-opacity-100 hover:shadow-lg">
                    {/* Image with Hover Blur Effect */}
                    <img 
                        src={nftData.image} 
                        alt={nftData.name} 
                        className="w-full h-full object-cover transition duration-300 group-hover:blur-sm"
                    />

                    {/* Text Fades in on Hover if not confirmed*/}
                    <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold opacity-0 transition duration-300 group-hover:opacity-100">
                        Buy
                    </span>
                  </div>
              )
          }
      </button>
    )
}
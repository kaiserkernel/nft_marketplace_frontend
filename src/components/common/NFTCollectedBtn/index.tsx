import { useState, useEffect } from "react";

import { NFTSetPriceModal } from "../NFTSetPriceModal";

import { fetchMetaData } from "../../../services/metaDataService";
import { NFTProps, NFTMetaData } from "../../../types";

interface NFTCollectedBtnProps {
    NFTProp: NFTProps;
    setNFTList: React.Dispatch<React.SetStateAction<NFTProps[]>>
}


export const NFTCollectedBtn = ({ NFTProp, setNFTList }: NFTCollectedBtnProps) => {
    const { tokenURI } = NFTProp;

    const [nftData, setNftData] = useState<NFTMetaData | null>(null);
    const [viewNFT, setViewNFT] = useState<boolean>(false);

    const handleViewNFT = () => {
        setViewNFT(true);
    }

    const handleCloseNFT = () => {
        setViewNFT(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data} = await fetchMetaData(tokenURI);
                setNftData(data);
            } catch (error) {
                console.error("Error fetching NFT metadata:", error);
            }
        };

        fetchData();
    }, [tokenURI]); // Re-run effect if tokenURI changes

    return (
        <>
            <button
                className="relative w-32 h-32 group bg-white rounded-md"
                onClick={handleViewNFT}
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
                                (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold opacity-0 transition duration-300 group-hover:opacity-100">
                                        View
                                    </span>
                                )
                        </div>
                    )
                }
            </button>
            <NFTSetPriceModal nftMetaData={nftData} nftProps={NFTProp} isOpen={viewNFT} onClose={handleCloseNFT} setNFTList={setNFTList}/>
          </>
    );
};

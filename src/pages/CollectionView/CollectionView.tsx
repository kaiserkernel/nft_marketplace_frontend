import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ThreeDot } from "react-loading-indicators";

import { notify } from "../../components/common/Notify";
import { NFTViewBtn } from "../../components/common/NFTViewBtn";

import { CollectionProps, NFTProps } from "../../types";
import { fetchNFTListOfCollection } from "../../services/nftService";

const CollectionView = () => {
    const location = useLocation();
    const collection: CollectionProps = location.state || {};

    const [nftList, setNftList] = useState<NFTProps[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchNFTList = async () => {
        setIsLoading(true);
        try {
            const { data } = await fetchNFTListOfCollection({collection: collection._id});
            setNftList(data);
            console.log(data, 'kkk')
        } catch (error) {
            notify("Fetch nfts of collection occur error", "error")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchNFTList();
    }, []);

    if (isLoading) {
        return ( 
            <div className="flex justify-center content-center">
            <ThreeDot color="#fff" size="large"/> 
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-4">
            {
                    nftList && nftList.map((nft: NFTProps, idx) => (
                        <NFTViewBtn
                            data={nft}
                            key={idx}
                        />
                    ))
            }
            </div>
        </div>
    )
}

export default CollectionView;
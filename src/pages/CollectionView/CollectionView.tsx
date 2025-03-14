import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ThreeDot } from "react-loading-indicators";
import { ToastContainer } from "react-toastify";
import { ethers } from "ethers";

import { notify } from "../../components/common/Notify";
import { NFTViewBtn } from "../../components/common/NFTViewBtn";
import InputField from "../../components/common/InputField";
import CheckboxGroup from "../../components/common/CheckboxGroup";
import FilterPanel from "../../components/common/FilterPanel";

import { CollectionProps, NFTProps } from "../../types";
import { fetchNFTListOfCollection, buyNFT } from "../../services/nftService";
import { ContractCollectionABI } from "../../contracts";
import { useContract } from "../../context/ContractContext";

interface FilterProps {
    maxPrice: number | null,
    minPrice: number | null
}

interface StatusProps {
    label: string,
    checked: boolean
}

const STATUSLIST: StatusProps[] = [
    { label: "All", checked: false },
    { label: "Fixed", checked: false },
    { label: "Auction", checked: false },
    { label: "Not for sale", checked: false },
];

const CollectionView = () => {
    const location = useLocation();
    const collection: CollectionProps = location.state || {};

    const [nftList, setNftList] = useState<NFTProps[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [filterItems, setFilterItems] = useState<FilterProps>({
        maxPrice: null,
        minPrice: null
    });
    const [statusList, setStatusList] = useState<StatusProps[]>(STATUSLIST);
    const [openedFilterPanel, setOpenedFilterPanel] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    const { walletAddress, signer, wsProvider } = useContract();
    const [collectionContract, setCollectionContract] = useState<ethers.Contract | null>(null);
    const [wsCollectionContract, setWsCollectionContract] = useState<ethers.Contract | null>(null);

    const fetchNFTList = async () => {
        setIsLoading(true);
        try {
            const { data } = await fetchNFTListOfCollection({collection: collection._id});
            setNftList(data);
        } catch (error) {
            notify("Fetch nfts of collection occur error", "error")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (collection?._id) fetchNFTList();
    }, [collection]);
 
    // Fetch and setup contract instances when the collection address is confirmed
    useEffect(() => {
        if (!walletAddress) {
            // notify("Please check out wallet connection", "error");
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
        console.log("listener ready")
        wsCollectionContract.on("NFTMinted", handleSavebuyNFTDB);

        return () => {
            wsCollectionContract.off("NFTMinted", handleSavebuyNFTDB);
        }
    }, [wsCollectionContract])

    const handleSearchValueChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(evt.target.value);
    }

    const handleSelectStatus = (_idx : number) => {
        setStatusList((prevStatusList) =>
          prevStatusList.map((status, idx) =>
            idx === _idx ? { ...status, checked: !status.checked } : status
          )
        );
    }

    const handleFilterItemChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = evt.target;
        if (name === "maxPrice" || name === "minPrice") {
            const parsedValue = Number(value);
            if (!isNaN(parsedValue)) setFilterItems(prev => ({...prev, [name]: parsedValue}));
        }
    } 

    const handleOpenFilterPannel = (panel: string) => {
        setOpenedFilterPanel((prev) => (prev === panel ? "" : panel));
        // Reset filters when opening a new panel
        if (openedFilterPanel !== panel) {
          setFilterItems({
            maxPrice: null,
            minPrice: null,
          });
        }
    }

    const handleSavebuyNFTDB = async (
        owner: string,
        _tokenId: number,
        _price: number
    ) => {
        try {
            const _buyData = { collection: collection._id, owner, tokenId: Number(_tokenId), price: Number(_price)};
            await buyNFT(_buyData);
            
            // Update nft list
            setNftList((prevNFTList) => {
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

    const handleBuyNft = async (price: number, tokenId: number) => {
        if (!price || !tokenId) return;
        if (!collectionContract) {
            notify("Please check out wallect connection", "error")
            return;
        }
        setIsProcessing(tokenId);
        try {
            const _price = BigInt(price * 10 ** 18); // Convert to BigInt and wei currency
            // Estimate the gas required for the transaction
            const gasEstimate = await collectionContract.buyNFT.estimateGas( tokenId, {
                value: _price
            } );
            
            // Mint the NFT on the blockchain
            const tx = await collectionContract.buyNFT( tokenId, { 
                gasLimit: gasEstimate,
                value: _price
            });
        
            const log = await tx.wait();
            console.log(log, 'log')
            // log.logs[0].address -> contractAddress 
            // log.from -> owner address
            notify("Buy NFT successfully", "success");
        } catch (error: any) {
            if (error.code !== "ACTION_REJECTED") {
                notify("Error occured on Buy NFT", "warning");
                console.log(error, 'error buy')
            }
        } finally {
            setIsProcessing(null);
        }
    }

    if (isLoading) {
        return ( 
            <div className="flex justify-center content-center">
                <ThreeDot color="#fff" size="large"/> 
            </div>
        )
    }

    return (
        <div className="w-full md:mb-10 mb-4">
            <ToastContainer />
            {collection && (
                <div className="relative w-full md:h-[75vh] h-[40vh]">
                    <img src={collection.image} className="w-full object-top object-cover md:h-[75vh] h-[40vh] rounded-2xl"/>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute bottom-4 md:left-4 left-0 text-white p-4 rounded-lg md:mb-10 mb-0">
                        <img src={collection.image} className="object-cover md:h-[15vh] md:w-[15vh] h-[10vh] w-[10vh] rounded-lg border-4 border-gray-200 hover:border-gray-400 transition-all duration-300 shadow-lg shadow-gray-500/30 mb-4"/>
                        <div>
                            <span className="md:text-xl text-md font-bold">{collection.name} </span>
                            <span className="md:text-md text-sm font-medium">{`(${collection.symbol})`}</span>
                        </div>
                        <div>
                            <span className="md:text-md text-sm font-medium">{collection.description}</span>
                        </div>
                        <p className="md:text-sm text-xs mt-1">
                            {`${collection.contractAddress?.slice(0, 4)}...${collection.contractAddress?.slice(-4)}`}
                        </p>
                    </div>
                </div>
            )}
            <hr className="border-t border-gray-700 my-4" />
            <div className="grid grid-cols-9">
                {/* filter pannel */}
                {/* status - filter */}
                <div className="col-span-2 md:mt-8 mt-4 md:pr-5">
                    <FilterPanel 
                        title="Status" 
                        panelKey="status" 
                        isOpen={openedFilterPanel === "status"} 
                        togglePanel={handleOpenFilterPannel}
                    >
                        <CheckboxGroup items={statusList} onSelect={handleSelectStatus} />
                    </FilterPanel>
                    
                    <FilterPanel 
                        title="Price" 
                        panelKey="price" 
                        isOpen={openedFilterPanel === "price"} 
                        togglePanel={handleOpenFilterPannel}
                    >
                        <div className="text-white">
                            <p className="mb-2">Max Price</p>
                            <InputField 
                                itemType="default" name="maxPrice" type="number"
                                value={filterItems.maxPrice ?? ""} placeholder="Please input Max price"
                                onChange={handleFilterItemChange}
                            />
                            <p className="mb-2 mt-3">Min Price</p>
                            <InputField 
                                itemType="default" name="minPrice" type="number"
                                value={filterItems.minPrice ?? ""} placeholder="Please input Min price"
                                onChange={handleFilterItemChange}
                            />
                        </div>
                    </FilterPanel>
                </div>
                {/* price filter */}

                <div className="flex flex-wrap gap-4 md:mt-8 mt-4 col-span-7">
                    <InputField 
                        itemType="default" type="text" 
                        name="search" value={searchValue} 
                        placeholder="Search by name or trait"
                        onChange={handleSearchValueChange}
                    />
                    {
                            nftList && nftList.map((nft: NFTProps, idx) => (
                                <NFTViewBtn
                                    handleBuyNft={handleBuyNft}
                                    nftData={nft}
                                    key={idx}
                                    isProcessing={isProcessing}
                                />
                            ))
                    }
                </div>
            </div>
        </div>
    )
}

export default CollectionView;
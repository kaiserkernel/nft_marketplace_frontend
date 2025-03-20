import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router";
import { ThreeDot } from "react-loading-indicators";
import { ToastContainer } from "react-toastify";
import { ethers } from "ethers";
import { FaAngleLeft, FaSort, FaSearch,FaAngleDown } from "react-icons/fa";

import { notify } from "../../components/common/Notify";
import { NFTViewBtn } from "../../components/common/NFTViewBtn";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import { MobilePanel } from "../../components/common/MobilePanel";
import RadioGroup from "../../components/common/RadioGroup";
import Accordion from "../../components/common/Accordian";

import { CollectionProps, NFTProps } from "../../types";
import { fetchNFTListOfCollection, buyNFT } from "../../services/nftService";
import { ContractCollectionABI } from "../../contracts";
import { useContract } from "../../context/ContractContext";
import { FormatToWeiCurrency } from "../../utils/FormatCurrency";
import { TransactionErrorhandle } from "../../utils/TransactionErrorhandle";
import { ItemGroupList } from "../../types";

// Constants
const initialSaleType: ItemGroupList[] = [
    { label: "All Types", checked: true, value: "all" },
    { label: "For Sale", checked: false, value: "fixed" },
    { label: "For Auction", checked: false, value: "auction" },
    { label: "Not For Sale", checked: false, value: "not_for_sale" },
];

const initialShowList: ItemGroupList[] = [
    { label: "Recently Created", checked: true, value: "created" },
    { label: "Highest last sale", checked: false, value: "last_sale" },
    { label: "Price high to low", checked: false, value: "high_low" },
    { label: "Price low to high", checked: false, value: "low_high" },
];  

const CollectionView = () => {
    const location = useLocation();
    const collection: CollectionProps = location.state || {};

    const [nftList, setNftList] = useState<NFTProps[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);
    const [isShowList, setIsShowList] = useState(false);
    const [selListItem, setSelListItem] = useState<string>("Recently Created");
    const [searchInput, setSearchInput] = useState<string>("");
    const [fromPrice, setFromPrice] = useState<number | null>(null);
    const [toPrice, setToPrice] = useState<number | null>(null);
    const [applyPriceFilter, setApplyPriceFilter] = useState<boolean>(false);
    const [isShowSearchPanel, setIsShowSearchPanel] = useState<boolean>(true);
    const [saleTypeRadios, setSaleTypeRadios] = useState<ItemGroupList[]>(initialSaleType);
  
    const { walletAddress, signer, wsProvider } = useContract();
    const [collectionContract, setCollectionContract] = useState<ethers.Contract | null>(null);
    const [wsCollectionContract, setWsCollectionContract] = useState<ethers.Contract | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNFTList = async () => {
        setIsLoading(true);
        try {
            const { data } = await fetchNFTListOfCollection({collection: collection._id});
            console.log(data, "data")
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

    const filteredNfts:NFTProps[] = useMemo(() => {
        let result:NFTProps[] = [...nftList];
        
        // Sale Type Filter
        const selectedType = saleTypeRadios.find(log => log.checked);
        if (selectedType && selectedType.value !== "all") {
          result = result.filter(log => log.priceType === selectedType.value);
        }
        
        // Price Filter
        if (applyPriceFilter) {
          result = result.filter((nft) => {
            if (fromPrice !== null && (!nft.price || nft.price < fromPrice)) return false;
            if (toPrice !== null && (!nft.price || nft.price > toPrice)) return false;
            return true;
          });
        }
        
        // Search Filter
        if (searchInput) {
          result = result.filter((nft) => nft.name?.includes(searchInput) || nft.description?.includes(searchInput));
        }
    
        console.log(result, "resl")
        // Sorting
        const sortStrategies: Record<string, (a: NFTProps, b: NFTProps) => number> = {
          "Recently Created": (a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
          "Highest last sale": (a, b) => (b.lastPrice?.value || 0) - (a.lastPrice?.value || 0),
          "Price high to low": (a, b) => (b.price || 0) - (a.price || 0),
          "Price low to high": (a, b) => (a.price || 0) - (b.price || 0),
        };
    
        return selListItem in sortStrategies ? result.sort(sortStrategies[selListItem]) : result;
      }, [nftList, saleTypeRadios, applyPriceFilter, fromPrice, toPrice, searchInput, selListItem])    

      const handleSaleTypeSelect = useCallback(
        (index: number) => setSaleTypeRadios((prev) => prev.map((item, idx) => ({ ...item, checked: idx === index }))),
        []
      );
    
      const handleApplyClick = useCallback(() => setApplyPriceFilter(true), []);

      const hanldeSetShowListItem = (item: string) => {
        setSelListItem(item);
        setIsShowList(false);
      };
      

    const handleSavebuyNFTDB = async (
        owner: string,
        _tokenId: number,
        _price: number,
        _currency: "BNB" | "ETH"
    ) => {
        try {
            const _buyData = { collection: collection._id, owner, tokenId: Number(_tokenId), price: Number(_price)};
            await buyNFT(_buyData);
            
            // Update nft list
            setNftList((prevNFTList) => {
                return prevNFTList.map((nft) => {
                    if (nft.tokenId === _tokenId) {
                        return { ...nft, price: 0, lastPrice: { value: _price, currency: _currency } }; // Update the price of the matched NFT
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
            const _price = FormatToWeiCurrency(price); // Convert to BigInt and wei currency
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
            TransactionErrorhandle(error);
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

    const PriceRangeSearchBar:React.FC = () => (
        <div>
          <div className="w-full flex flex-row items-center justify-between gap-4 mt-2">
            <InputField
              itemType="default"
              name="from"
              type="number"
              placeholder="From"
              value={fromPrice ?? ""}
              bordered
              onChange={(evt) => {
                const _value = Number(evt.target.value);
                if (isNaN(_value)) return;
                setApplyPriceFilter(false);
                setFromPrice(_value);
              }}
            />
            <InputField
              itemType="default"
              name="toPrice"
              type="number"
              placeholder="To"
              value={toPrice ?? ""}
              bordered
              onChange={(evt) => {
                const _value = Number(evt.target.value);
                if (isNaN(_value)) return;
                setApplyPriceFilter(false);
                setToPrice(_value);
              }}
            />
          </div>
          <div className="w-full mt-4">
            <Button
              type="primary"
              width="full"
              label={applyPriceFilter ? "Applied" : "Apply"}
              onClick={handleApplyClick}
            />
          </div>
        </div>
      )

    return (
        <div className="w-full md:mb-10 mb-4">
            <ToastContainer  toastStyle={{ backgroundColor: "black" }}  />
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
            
            {/* Navigation section */}
            <div className="flex flex-row items-center justify-between gap-4">
                <Button
                label="Filters"
                icon={
                    isShowSearchPanel ? (
                    <FaSort className="text-white" />
                    ) : (
                    <FaAngleLeft className="text-white" />
                    )
                }
                iconPosition="left"
                type="primary"
                onClick={() => setIsShowSearchPanel(!isShowSearchPanel)}
                mobileHideLabel={true}
                />
                <p className="text-base font-bold text-[#8F95A0] md:block hidden">{filteredNfts.length} items</p>
                <div className="flex-1">
                <InputField
                    itemType="default"
                    type="text"
                    name="search"
                    icon={<FaSearch className="text-white/80" />}
                    placeholder="Name or description"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                </div>
                <Dropdown
                items={initialShowList}
                isOpen={isShowList}
                setIsOpen={setIsShowList}
                ref={dropdownRef}
                className="md:block hidden"
                setSelectedItem={setSelListItem}
                >
                <Button
                    label={selListItem}
                    icon={<FaAngleDown className="text-white" />}
                    iconPosition="right"
                    type="primary"
                    onClick={() => setIsShowList(!isShowList)}
                    mobileHideLabel={true}
                />
                </Dropdown>
            </div>
            {/* Content section */}
            <div className="grid grid-cols-10 gap-4 mt-4">
                <div className={`${isShowSearchPanel ? "xl:col-span-2 md:col-span-3 md:block" : "md:hidden"} col-span-0 md:block hidden rounded-xl bg-[#0c0c0c] p-4`}>  
                <Accordion label="Sale Type">
                    <RadioGroup
                    items={saleTypeRadios}
                    onSelect={handleSaleTypeSelect}
                    />
                </Accordion>
                <Accordion label="Price Range">
                    <PriceRangeSearchBar />
                </Accordion>
                </div>
                {/* price filter */}

                <div className={`${isShowSearchPanel ? "xl:col-span-8 md:col-span-7" : "col-span-10"} col-span-10 rounded-xl`}>
                    <div className="p-4 flex md:gap-4 gap-8 flex-wrap justify-between">
                        {
                                filteredNfts && filteredNfts.map((nft: NFTProps, idx) => (
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
            {/* Mobile Search Panel */}
            <MobilePanel
                isOpen={!isShowSearchPanel}
                onClose={() => setIsShowSearchPanel(true)}
            >
                <div className="grid px-4">
                <p className="text-base font-bold">Sale Type</p>
                    <RadioGroup
                    items={saleTypeRadios}
                    onSelect={handleSaleTypeSelect}
                    />
                <hr className="border-gray-600 py-2"/>
                <p className="text-base font-bold">Price Range</p>
                    <PriceRangeSearchBar />
                </div>
            </MobilePanel>
            <MobilePanel
                isOpen={isShowList}
                onClose={() => setIsShowList(false)}
            >
                <div className="gap-4 flex flex-col w-full">
                {
                initialShowList.map((log, idx) => (
                    <button 
                    className="block p-2 border border-1 border-gray-600 rounded-2xl my-3" 
                    onClick={() => hanldeSetShowListItem(log.label)}
                    key={idx}
                    >
                    <p className="text-lg font-bold">{log.label}</p>
                    </button>
                ))
                }
                </div>
            </MobilePanel>
        </div>
    )
}

export default CollectionView;
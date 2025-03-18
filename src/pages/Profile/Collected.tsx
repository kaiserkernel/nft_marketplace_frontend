import { useEffect, useState, useRef, useMemo } from "react";
import { FaAngleDown, FaAngleLeft, FaSearch, FaSort, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router";

import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import Accordian from "../../components/common/Accordian";
import RadioGroup from "../../components/common/RadioGroup";
import { notify } from "../../components/common/Notify";
import { NFTCollectedBtn } from "../../components/common/NFTCollectedBtn";
import { MobilePanel } from "../../components/common/MobilePanel";
import Dropdown from "../../components/common/Dropdown";

import { NFTProps, CollectionProps, ItemGroupList } from "../../types";
import { useContract } from "../../context/ContractContext";
import { fetchOwnedNFT } from "../../services/nftService";

const initialSaleType: ItemGroupList[] = [
  { label: "All Types", checked: true, value: "all" },
  { label: "For Sale", checked: false, value: "fixed" },
  { label: "For Auction", checked: false, value: "auction" },
  { label: "Not For Sale", checked: false, value: "not_for_sale" },
];

// Define the dropdown items
const initialShowList: ItemGroupList[] = [
  { label: "Recently Created", checked: true, value: "created" },
  { label: "Highest last sale", checked: false, value: "last_sale" },
  { label: "Price high to low", checked: false, value: "high_low" },
  { label: "Price low to high", checked: false, value: "low_high" },
];

const Collected = () => {
  const [isShowList, setIsShowList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selListItem, setSelListItem] = useState<string>("Recently Created");

  const [search, setSearch] = useState<string>("");
  const [fromPrice, setFromPrice] = useState<number | null>(null);
  const [toPrice, setToPrice] = useState<number | null>(null);
  const [applyPriceFilter, setApplyPriceFilter] = useState<boolean>(false);
  const [isShowSearchPanel, setIsShowSearchPanel] = useState<boolean>(true);
  const [saleTypeRadios, setSaleTypeRadios] = useState<ItemGroupList[]>(
    initialSaleType
  );
  const [showListRadios, setShowListRadios] = useState<ItemGroupList[]>(
    initialShowList
  )
  const navigate = useNavigate();

  const [nftList, setNFTList] = useState<NFTProps[]>([]);
  const [collectionList, setCollectionList] = useState<CollectionProps[]>([]);

  const { walletAddress } = useContract();

  const handleSaleTypeSelect = (index: number) => {
    setSaleTypeRadios((prev) =>
      prev.map((item, idx) => ({ ...item, checked: idx === index }))
    );
  };

  const hanldeSetShowListItem = (item: string) => {
    setSelListItem(item);
    setIsShowList(false);
  };

  const handleCloseSearchPanel = () => {
    setIsShowSearchPanel(false);
  }

  const handleCloseShowList = () => {
    setIsShowList(false);
  }

  const handleShowlistClick = () => {
    setIsShowList(!isShowList);
  };

  const handleAddNFTClick = () => {
    navigate("/create-in-collection");
  };

  const handleApplyClick = () => {
    setApplyPriceFilter(true);
  };

  const viewNftList:NFTProps[] = useMemo(() => {
    let _resList:NFTProps[] = nftList;
    // filter
    // 1 - sale type
    const selectedType = saleTypeRadios.find(log => log.checked);
    if (selectedType && selectedType.value !== "all") {
      _resList = _resList.filter(log => log.priceType === selectedType.value);
    }
    
    // 2 - sale price
    if (applyPriceFilter) {
      if (fromPrice) {
          _resList = _resList.filter(log => log.price ? log.price > fromPrice : false);
      }
      if (toPrice) {
        _resList = _resList.filter(log => log.price ? log.price < toPrice : false);
      }
    }

    // sort
    return nftList
  }, [nftList])
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!walletAddress) {
        notify("Please check out wallet connection", "warning");
        return;
      }
      const { nfts } = await fetchOwnedNFT(walletAddress);

      // Use a Map to store unique collections by their _id
      const collectionMap = new Map();

      // Loop through the NFTs and extract the collection
      nfts.forEach((nft: NFTProps) => {
          collectionMap.set(nft?.collection?._id, nft.collection); // _id as the key
      });
      setNFTList(nfts);

      // Convert Map values to an array of unique collections
      const uniqueCollections = Array.from(collectionMap.values());
      setCollectionList(uniqueCollections);
    }
    fetchInitialData();
  }, [walletAddress])

  const PriceRangeSearchBar:React.FC = () => (
    <div>
      <div className="w-full flex flex-row items-center justify-between gap-4 mt-2">
        <InputField
          itemType="default"
          name="from"
          type="text"
          placeholder="From"
          value={fromPrice}
          bordered
          onChange={(e) => {
            const _value = Number(e.target.value);
            if (isNaN(_value)) return;
            setFromPrice(_value);
          }}
        />
        <InputField
          itemType="default"
          name="toPrice"
          type="text"
          placeholder="To"
          value={toPrice}
          bordered
          onChange={(e) => {
            const _value = Number(e.target.value);
            if (isNaN(_value)) return;
            setToPrice(_value);
          }}
        />
      </div>
      <div className="w-full mt-4">
        <Button
          type="primary"
          width="full"
          label="Apply"
          onClick={handleApplyClick}
        />
      </div>
    </div>
  )

  return (
    <div className="w-full py-4">
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
        <p className="text-base font-bold text-[#8F95A0] md:block hidden">{nftList.length} items</p>
        <div className="flex-1">
          <InputField
            itemType="default"
            type="text"
            name="search"
            icon={<FaSearch className="text-white/80" />}
            placeholder="Name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            onClick={handleShowlistClick}
            mobileHideLabel={true}
          />
        </Dropdown>
        <Button 
          label="Add NFT" 
          type="blue" 
          onClick={handleAddNFTClick} 
          iconPosition="right"
          icon={<FaPlus className="text-white"/>}
          mobileHideLabel={true}
        />
      </div>
      {/* Content section */}
      <div className="grid grid-cols-10 gap-4 mt-4">
        <div className={`${isShowSearchPanel ? "xl:col-span-2 md:col-span-3 md:block" : "md:hidden"} col-span-0 md:block hidden rounded-xl bg-[#0c0c0c] p-4`}>  
          <Accordian label="Sale Type">
            <RadioGroup
              items={saleTypeRadios}
              onSelect={handleSaleTypeSelect}
            />
          </Accordian>
          <Accordian label="Price Range">
            <PriceRangeSearchBar />
          </Accordian>
        </div>
        <div className={`${isShowSearchPanel ? "xl:col-span-8 md:col-span-7" : "col-span-10"} col-span-10 rounded-xl`}>
          <div className="p-4 flex gap-4 flex-wrap">
            {
              viewNftList.map((log: NFTProps, idx) => (
                <NFTCollectedBtn key={idx} NFTProp={log} setNFTList={setNFTList}/>
              ))
            }
          </div>
        </div>
      </div>
      {/* Mobile Search Panel */}
      <MobilePanel
        isOpen={isShowSearchPanel}
        onClose={handleCloseSearchPanel}
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
        onClose={handleCloseShowList}
      >
        <div className="gap-4 flex flex-col w-full">
        {
          showListRadios.map(log => (
            <button className="block p-2 border border-1 border-gray-600 rounded-2xl my-3" onClick={() => hanldeSetShowListItem(log.label)}>
              <p className="text-lg font-bold">{log.label}</p>
            </button>
          ))
        }
        </div>
      </MobilePanel>
    </div>
  );
};

export default Collected;

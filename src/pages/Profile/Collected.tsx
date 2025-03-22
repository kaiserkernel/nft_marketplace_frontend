import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  FaAngleDown,
  FaAngleLeft,
  FaSearch,
  FaSort,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { ThreeDot } from "react-loading-indicators";
import { useAccount } from "wagmi";

import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import Accordian from "../../components/common/Accordian";
import RadioGroup from "../../components/common/RadioGroup";
import { notify } from "../../components/common/Notify";
import { NFTCollectedBtn } from "../../components/common/NFTCollectedBtn";
import { MobilePanel } from "../../components/common/MobilePanel";
import Dropdown from "../../components/common/Dropdown";

import { NFTProps, CollectionProps, ItemGroupList } from "../../types";
import { fetchOwnedNFT } from "../../services/nftService";

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

const Collected = () => {
  const [isShowList, setIsShowList] = useState(false);
  const [selListItem, setSelListItem] = useState<string>("Recently Created");
  const [searchInput, setSearchInput] = useState<string>("");
  const [fromPrice, setFromPrice] = useState<number | null>(null);
  const [toPrice, setToPrice] = useState<number | null>(null);
  const [applyPriceFilter, setApplyPriceFilter] = useState<boolean>(false);
  const [isShowSearchPanel, setIsShowSearchPanel] = useState<boolean>(true);
  const [saleTypeRadios, setSaleTypeRadios] =
    useState<ItemGroupList[]>(initialSaleType);
  const [nftList, setNFTList] = useState<NFTProps[]>([]);
  const [collectionList, setCollectionList] = useState<CollectionProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { address } = useAccount();
  const walletAddress = address as string;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!walletAddress) return;

      setIsLoading(true);
      try {
        const { nfts } = await fetchOwnedNFT(walletAddress);
        setNFTList(nfts);

        // Use a Map to store unique collections by their _id
        const collectionMap = new Map();

        // Loop through the NFTs and extract the collection
        nfts.forEach((nft: NFTProps) => {
          collectionMap.set(nft?.collection?._id, nft.collection); // _id as the key
        });

        // Convert Map values to an array of unique collections
        const uniqueCollections = Array.from(collectionMap.values());
        setCollectionList(uniqueCollections);
      } catch (error) {
        console.log(error, "initial error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [walletAddress]);

  const handleSaleTypeSelect = useCallback(
    (index: number) =>
      setSaleTypeRadios((prev) =>
        prev.map((item, idx) => ({ ...item, checked: idx === index }))
      ),
    []
  );

  const handleApplyClick = useCallback(() => setApplyPriceFilter(true), []);

  const hanldeSetShowListItem = (item: string) => {
    setSelListItem(item);
    setIsShowList(false);
  };

  const filteredNfts: NFTProps[] = useMemo(() => {
    let result: NFTProps[] = [...nftList];

    // Sale Type Filter
    const selectedType = saleTypeRadios.find((log) => log.checked);
    if (selectedType && selectedType.value !== "all") {
      result = result.filter((log) => log.priceType === selectedType.value);
    }

    // Price Filter
    if (applyPriceFilter) {
      result = result.filter((nft) => {
        if (fromPrice !== null && (!nft.price || nft.price < fromPrice))
          return false;
        if (toPrice !== null && (!nft.price || nft.price > toPrice))
          return false;
        return true;
      });
    }

    // Search Filter
    if (searchInput) {
      result = result.filter(
        (nft) =>
          nft.name?.includes(searchInput) ||
          nft.description?.includes(searchInput)
      );
    }

    // Sorting
    const sortStrategies: Record<string, (a: NFTProps, b: NFTProps) => number> =
      {
        "Recently Created": (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
        "Highest last sale": (a, b) => (b.lastPrice || 0) - (a.lastPrice || 0),
        "Price high to low": (a, b) => (b.price || 0) - (a.price || 0),
        "Price low to high": (a, b) => (a.price || 0) - (b.price || 0),
      };

    return selListItem in sortStrategies
      ? result.sort(sortStrategies[selListItem])
      : result;
  }, [
    nftList,
    saleTypeRadios,
    applyPriceFilter,
    fromPrice,
    toPrice,
    searchInput,
    selListItem,
  ]);

  const PriceRangeSearchBar: React.FC = () => (
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
  );

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
        <p className="text-base font-bold text-[#8F95A0] md:block hidden">
          {filteredNfts.length} items
        </p>
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
        <Button
          label="Add NFT"
          type="blue"
          onClick={() => navigate("/create-in-collection")}
          iconPosition="right"
          icon={<FaPlus className="text-white" />}
          mobileHideLabel={true}
        />
      </div>
      {/* Content section */}
      <div className="grid grid-cols-10 gap-4 mt-4">
        <div
          className={`${
            isShowSearchPanel
              ? "xl:col-span-2 md:col-span-3 md:block"
              : "md:hidden"
          } col-span-0 md:block hidden rounded-xl bg-[#0c0c0c] p-4`}
        >
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
        <div
          className={`${
            isShowSearchPanel ? "xl:col-span-8 md:col-span-7" : "col-span-10"
          } col-span-10 rounded-xl`}
        >
          <div className="p-4 flex gap-4 flex-wrap">
            {isLoading ? (
              <ThreeDot color="#fff" size="large" />
            ) : (
              filteredNfts.map((log: NFTProps, idx) => (
                <NFTCollectedBtn
                  key={idx}
                  NFTProp={log}
                  setNFTList={setNFTList}
                />
              ))
            )}
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
          <RadioGroup items={saleTypeRadios} onSelect={handleSaleTypeSelect} />
          <hr className="border-gray-600 py-2" />
          <p className="text-base font-bold">Price Range</p>
          <PriceRangeSearchBar />
        </div>
      </MobilePanel>
      <MobilePanel isOpen={isShowList} onClose={() => setIsShowList(false)}>
        <div className="gap-4 flex flex-col w-full">
          {initialShowList.map((log, idx) => (
            <button
              className="block p-2 border border-1 border-gray-600 rounded-2xl my-3"
              onClick={() => hanldeSetShowListItem(log.label)}
              key={idx}
            >
              <p className="text-lg font-bold">{log.label}</p>
            </button>
          ))}
        </div>
      </MobilePanel>
    </div>
  );
};

export default Collected;

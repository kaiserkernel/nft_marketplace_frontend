import { FC, ReactNode, useEffect, useState } from "react";
import { ThreeDot } from "react-loading-indicators";

import CardBtn from "../../components/common/CardBtn";
import ManipulateSlider from "../../components/common/ManipulateSlider";

import { CollectionProps, NFTProps } from "../../types";
import { fetchAllCollection } from "../../services/colllectionService";
import { fetchTopAuctions } from "../../services/nftService";

const Dashboard: FC = () => {
  const [collectionList, setCollectionList] = useState<CollectionProps[]>([]);
  const [topAuctionList, setTopAuctionList] = useState<NFTProps[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState<boolean>(true);
  const [isTopAuctionLoading, setIsTopAuctionLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsCollectionLoading(true);
      try {
        const { data } = await fetchAllCollection();
        setCollectionList(data);
      } catch (error) {
        console.log(error, "Error occur fetch Collecions");
      } finally {
        setIsCollectionLoading(false);
      }

      setIsTopAuctionLoading(true);
      try {
        const { data } = await fetchTopAuctions();
        console.log(data, "top aution");
        setTopAuctionList(data);
      } catch (error) {
        console.log(error, "Error occur fetch Collecions");
      } finally {
        setIsTopAuctionLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const renderCollectionCards = (itemList: CollectionProps[]): ReactNode[] => {
    return (
      itemList &&
      itemList.map((item, idx) => (
        <CardBtn key={idx} collection={item} cardType="Collection" />
      ))
    );
  };

  const renderNFTCards = (itemList: NFTProps[]): ReactNode[] => {
    return (
      itemList &&
      itemList.map((item, idx) => (
        <CardBtn key={idx} nft={item} cardType="NFT" />
      ))
    );
  };

  return (
    <>
      {/* Intro Collections */}
      <div className="w-full">
        <h2 className="text-white text-3xl font-semibold md:pb-8 pb-4">
          Collections
        </h2>
        {!!isCollectionLoading ? (
          <div className="flex justify-center content-center">
            <ThreeDot color="#ffffff" size="large" />
          </div>
        ) : collectionList && collectionList?.length > 0 ? (
          <ManipulateSlider itemList={renderCollectionCards(collectionList)} />
        ) : (
          <h1 className="text-white md:text-xl text-lg text-center md:font-semibold font-bold">
            No Collection
          </h1>
        )}
      </div>

      {/* Top Auctions Section */}
      <div className="w-full py-32">
        <h2 className="text-white text-3xl font-semibold md:pb-8 pb-4">
          Top Auctions
        </h2>
        {!!isTopAuctionLoading ? (
          <div className="flex justify-center content-center">
            <ThreeDot color="#ffffff" size="large" />
          </div>
        ) : topAuctionList && topAuctionList?.length > 0 ? (
          <div className="mt-8">
            <ManipulateSlider itemList={renderNFTCards(topAuctionList)} />
          </div>
        ) : (
          <h1 className="text-white md:text-xl text-lg text-center md:font-semibold font-bold">
            No Auction
          </h1>
        )}
      </div>
    </>
  );
};

export default Dashboard;

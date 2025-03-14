import { FC, ReactNode, useEffect, useState } from "react";
import { ThreeDot } from "react-loading-indicators";

import CollectionCard from "../../components/common/CollectionCard";
import ManipulateSlider from "../../components/common/ManipulateSlider";

import { CollectionProps } from "../../types";
import { fetchAllCollection } from "../../services/colllectionService";

const Dashboard:FC = () => {
  const [ collectionList, setCollectionList ] = useState<CollectionProps[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const { data } = await fetchAllCollection();
        setCollectionList(data);
        console.log(data, "data")
      } catch (error) {
        console.log(error, "Error occur fetch Collecions")
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [])

  const renderCollectionCards = (itemList: CollectionProps[]): ReactNode[] => {
    return itemList.map((item, idx) => (
      <CollectionCard collection={item} key={idx}/>
    ));
  };

  return (
    <>
      {/* Intro Collections */}
      <div className="w-full">
        {/* {
          !!isLoading ? (
            <>
              <ThreeDot color="#ffffff" size="large" />
            </>
          ) : (
              <ManipulateSlider itemList={renderCollectionCards(collectionList)} />
          )
        } */}
        <ManipulateSlider itemList={renderCollectionCards(collectionList)} />
      </div>

      {/* Top Auctions Section */}
      <div className="w-full py-32">
        <h2 className="text-white text-3xl font-semibold">Top Auctions</h2>
        <div className="mt-8">
          {/* <ManipulateSlider items={renderCollectionCards(introCollectionCardGroup)} /> */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

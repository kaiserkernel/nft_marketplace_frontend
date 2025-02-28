import React, { ReactNode } from "react";
import CollectionCard from "../../components/common/CollectionCard";
import type { CollectionCardType } from "../../components/common/CollectionCard";
import ManipulateSlider from "../../components/common/ManipulateSlider";

const introCollectionCardGroup: CollectionCardType[] = [
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
  {
    name: "Baseheads",
    des: "LAUNCHPAD",
    text: "This is the basehead's colletion and this is really hot collection and I love this",
  },
];

const Dashboard = () => {
  const renderCollectionCards = (items: CollectionCardType[]): ReactNode[] => {
    return items.map((item, index) => (
      <CollectionCard
        key={index}
        name={item.name}
        des={item.des}
        text={item.text}
        source={item.source}
        width={400}
        height={400}
      />
    ));
  };

  return (
    <>
      {/* Intro Collections */}
      <div className="w-full">
        <ManipulateSlider
          items={renderCollectionCards(introCollectionCardGroup)}
        />
      </div>
      <div className="w-full py-32">
        <h2 className="text-white text-3xl font-semibold">Top Auctions</h2>
        <div className="mt-8">
          <ManipulateSlider
            items={renderCollectionCards(introCollectionCardGroup)}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;

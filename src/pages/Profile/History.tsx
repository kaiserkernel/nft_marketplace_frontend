import React, { useState } from "react";
import CheckboxGroup from "../../components/common/CheckboxGroup";
import type { CheckBoxItemType } from "../../components/common/CheckboxGroup";
import {
  FaArchway,
  FaBackspace,
  FaExchangeAlt,
  FaFire,
  FaHouzz,
  FaLock,
  FaPlusCircle,
  FaShoppingCart,
  FaTicketAlt,
} from "react-icons/fa";
import type { HistoryCardGroupItemType } from "./HistoryCardGroup";
import HistoryCardGroup from "./HistoryCardGroup";

const initialEventTypeGroup: CheckBoxItemType[] = [
  {
    label: "Purchased NFTs",
    checked: false,
    icon: <FaShoppingCart className="text-white" />,
  },
  {
    label: "Received NFTs",
    checked: false,
    icon: <FaPlusCircle className="text-white" />,
  },
  {
    label: "Sold NFTs",
    checked: false,
    icon: <FaLock className="text-white" />,
  },
  {
    label: "Sent NFTs",
    checked: false,
    icon: <FaExchangeAlt className="text-white" />,
  },
  {
    label: "NFTs burned",
    checked: false,
    icon: <FaFire className="text-white" />,
  },
  {
    label: "Listings",
    checked: false,
    icon: <FaTicketAlt className="text-white" />,
  },
  {
    label: "Canceled Sales",
    checked: false,
    icon: <FaBackspace className="text-white" />,
  },
  {
    label: "Created Auctions",
    checked: false,
    icon: <FaHouzz className="text-white" />,
  },
  {
    label: "Canceled Auctions",
    checked: false,
    icon: <FaBackspace className="text-white" />,
  },
  {
    label: "Bids",
    checked: false,
    icon: <FaArchway className="text-white" />,
  },
  {
    label: "Offers",
    checked: false,
    icon: <FaTicketAlt className="text-white" />,
  },
];

const initialHistoryCardGroup: HistoryCardGroupItemType[] = [
  {
    statusIcon: <FaTicketAlt className="text-white w-5 h-5" />,
    statusLabel: "PUT ON SALE",
    nftImg: "./assets/logo.png",
    nftType: "single",
    nftName: "CHRLE",
    date: "14 Feb, 7:34 PM",
    price: "5",
  },
  {
    statusIcon: <FaTicketAlt className="text-white w-5 h-5" />,
    statusLabel: "PUT ON SALE",
    nftImg: "./assets/logo.png",
    nftType: "single",
    nftName: "CHRLE",
    date: "14 Feb, 7:34 PM",
    price: "5",
  },
  {
    statusIcon: <FaTicketAlt className="text-white w-5 h-5" />,
    statusLabel: "PUT ON SALE",
    nftImg: "./assets/logo.png",
    nftType: "single",
    nftName: "CHRLE",
    date: "14 Feb, 7:34 PM",
    price: "5",
  },
  {
    statusIcon: <FaTicketAlt className="text-white w-5 h-5" />,
    statusLabel: "PUT ON SALE",
    nftImg: "./assets/logo.png",
    nftType: "single",
    nftName: "CHRLE",
    date: "14 Feb, 7:34 PM",
    price: "5",
  },
  {
    statusIcon: <FaTicketAlt className="text-white w-5 h-5" />,
    statusLabel: "PUT ON SALE",
    nftImg: "./assets/logo.png",
    nftType: "single",
    nftName: "CHRLE",
    date: "14 Feb, 7:34 PM",
    price: "5",
  },
];

const History = () => {
  const [eventSelectGroup, setEventSelectGroup] = useState<CheckBoxItemType[]>(
    initialEventTypeGroup
  );

  const handleEventTypeSelect = (index: number) => {
    setEventSelectGroup((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="w-full py-4 flex flex-row gap-10">
      <div className="basis-1/6 bg-[#0c0c0c] rounded-xl p-4">
        <CheckboxGroup
          items={eventSelectGroup}
          onSelect={handleEventTypeSelect}
        />
      </div>
      <div className="basis-5/6 rounded-xl">
        <div className="h-[800px] overflow-x-hidden overflow-y-scroll p-4">
          <HistoryCardGroup items={initialHistoryCardGroup} />
        </div>
      </div>
    </div>
  );
};

export default History;

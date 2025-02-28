import React, { FC, ReactNode } from "react";

export type HistoryCardGroupItemType = {
  statusIcon?: ReactNode;
  statusLabel: string;
  nftImg: string;
  date: string;
  nftType: "single" | "collection";
  nftName: string;
  price?: string;
};

interface HistoryCardGroupProps {
  items: HistoryCardGroupItemType[];
}

const HistoryCardGroup: FC<HistoryCardGroupProps> = ({ items }) => {
  return (
    <div className="w-full flex flex-col gap-10">
      {items.map((item, index) => (
        <div className="w-full" key={index}>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              {item.statusIcon}
              <span className="text-white font-semibold text-sm">
                {item.statusLabel}
              </span>
            </div>
            <span className="text-white font-semibold text-sm">
              {item.date}
            </span>
          </div>
          <div className="h-[150px] w-full rounded-xl flex gap-4 bg-[#1F1F21] mt-4">
            <img
              className="w-[150px] h-[150px]"
              src={item.nftImg}
              alt={item.nftName}
            />
            <div className="flex flex-col items-start justify-center gap-1">
              <span className="text-slate-500">
                {item.nftType === "single" ? "Single" : "Collection"} NFT
              </span>
              <span className="text-white font-semibold text-md">
                {item.nftName}
              </span>
              <div className="flex flex-row items-center gap-2">
                <img src="./assets/bnb.svg" alt="BNB" className="w-5 h-5" />
                <span className="font-semibold text-white text-md">
                  {item.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryCardGroup;

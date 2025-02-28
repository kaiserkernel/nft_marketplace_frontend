import React, { useState } from "react";
import Button from "../../components/common/Button";
import { FaAngleDown, FaAngleLeft, FaSearch, FaSort } from "react-icons/fa";
import InputField from "../../components/common/InputField";
import Accordian from "../../components/common/Accordian";
import RadioGroup from "../../components/common/RadioGroup";
import type { RadioGroupItemType } from "../../components/common/RadioGroup";

const initialSaleTypeRadios: RadioGroupItemType[] = [
  { label: "All Types", checked: true },
  { label: "For Sale", checked: false },
  { label: "For Auction", checked: false },
  { label: "Not For Sale", checked: false },
];

const Collected = () => {
  const [search, setSearch] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [saleTypeRadios, setSaleTypeRadios] = useState<RadioGroupItemType[]>(
    initialSaleTypeRadios
  );

  const handleSaleTypeSelect = (index: number) => {
    setSaleTypeRadios((prev) =>
      prev.map((item, idx) => ({ ...item, checked: idx === index }))
    );
  };

  const handleOrderClick = () => {};

  const handleAddNFTClick = () => {};

  const handleApplyClick = () => {};

  return (
    <div className="w-full py-4">
      {/* Navigation section */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Button
          label="Filters"
          icon={
            isFiltered ? (
              <FaSort className="text-white" />
            ) : (
              <FaAngleLeft className="text-white" />
            )
          }
          iconPosition="left"
          type="primary"
          onClick={() => {
            setIsFiltered(!isFiltered);
          }}
        />
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
        <Button
          label="Recently added"
          icon={<FaAngleDown className="text-white" />}
          iconPosition="right"
          type="primary"
          onClick={handleOrderClick}
        />
        <Button label="Add NFT" type="blue" onClick={handleAddNFTClick} />
      </div>
      {/* Content section */}
      <div className="flex flex-row items-start gap-4 mt-4">
        <div className="basis-1/6 rounded-xl bg-[#0c0c0c] p-4">
          <Accordian label="Sale Type">
            <RadioGroup
              items={saleTypeRadios}
              onSelect={handleSaleTypeSelect}
            />
          </Accordian>
          <Accordian label="Price Range">
            <div className="w-full flex flex-row items-center justify-between gap-4 mt-2">
              <InputField
                itemType="default"
                name="from"
                type="text"
                placeholder="From"
                value={from}
                bordered
                onChange={(e) => {
                  setFrom(e.target.value);
                }}
              />
              <InputField
                itemType="default"
                name="To"
                type="text"
                placeholder="To"
                value={to}
                bordered
                onChange={(e) => {
                  setTo(e.target.value);
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
          </Accordian>
          <div className="h-4"></div>
        </div>
        <div className="basis-5/6 rounded-xl">
          <div className="h-[800px] overflow-x-hidden overflow-y-scroll p-4">
            <img
              className="w-[200px] h-[200px]"
              src="./assets/logo.png"
              alt="Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collected;

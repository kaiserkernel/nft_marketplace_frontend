import React, { useState } from "react";
import InputField from "../../common/InputField";
import { FaSearch } from "react-icons/fa";
import ProfileDropdown from "../../common/ProfileDropdown";

const Navbar = () => {
  const [search, setSearch] = useState<string | null>(null);

  return (
    <div className="w-full h-[120px] bg-[#111111] flex flex-row items-center justify-between px-4 border border-[#444444] z-50">
      <div className="flex flex-row items-center gap-14">
        <img src="./assets/logo.png" alt="Logo" className="w-24 h-24" />
        <h1 className="gradient-text text-2xl font-semibold">
          NFT Marketplace
        </h1>
        <InputField
          itemType="colorful"
          type="text"
          name="search"
          width={400}
          icon={<FaSearch className="text-white/80" />}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>
      <ProfileDropdown />
    </div>
  );
};

export default Navbar;

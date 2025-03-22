import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FaSearch } from "react-icons/fa";

import InputField from "../../common/InputField";
import ProfileDropdown from "../../common/ProfileDropdown";

const Navbar = () => {
  const [search, setSearch] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClickLogo = () => {
    navigate("/");
  };

  return (
    <div className="w-full h-[120px] bg-[#111111] flex flex-row items-center justify-between px-4 border border-[#444444] z-50">
      <div className="flex flex-row items-center md:justify-between justify-start md:gap-10 gap-5">
        <img
          src="./assets/logo.png"
          alt="Logo"
          className="md:w-24 w-20 md:h-24 h-20 cursor-pointer"
          onClick={handleClickLogo}
        />
        <h1
          className="gradient-text lg:text-2xl md:text-xl md:block hidden font-semibold cursor-pointer md:pr-0"
          onClick={handleClickLogo}
        >
          NFT Marketplace
        </h1>
        {/* <InputField
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
        /> */}
      </div>
      <ProfileDropdown />
    </div>
  );
};

export default Navbar;

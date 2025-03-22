import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAngleRight,
  FaCircleNotch,
  FaGithub,
  FaPlusCircle,
  FaRegFolder,
  FaRegFolderOpen,
  FaSignOutAlt,
  FaTelegram,
  FaTwitter,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ConnectWallet from "../ConnectWallet";
import { useAppKit } from "@reown/appkit/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useAccount } from "wagmi";

import Avatar from "../Avatar";
import type { DropdownItemType } from "../Dropdown";
import IconButton from "../IconButton";
import Button from "../Button";

import { FormatAddress } from "../../../utils/FormatAddress";

const dropdownItems: DropdownItemType[] = [
  {
    label: "Single NFT",
    icon: <FaCircleNotch className="text-white" />,
    link: "/create-single",
  },
  {
    label: "NFT in Collection",
    icon: <FaRegFolderOpen className="text-white" />,
    link: "/create-in-collection",
  },
  { label: "Collection", icon: <FaRegFolder className="text-white" /> },
];

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const walletAddress = address as string;
  // const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isConnected) setIsOpen(false);
  }, [isConnected]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* {!isConnected ? (
        // <ConnectWallet />
        <ConnectButton label="Connect Wallet" />
      ) : (
        <IconButton
          icon={<FaUser className="text-white" />}
          onClick={() => setIsOpen(!isOpen)}
        />
      )} */}
      <div className="flex flex-wrap">
        <p className="text-white">{isConnected}</p>
        <ConnectButton label="Connect Wallet" />
        {isConnected && (
          <div className="ps-3">
            <IconButton
              icon={<FaUser className="text-white" />}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: "auto" }}
            animate={{
              opacity: 1,
              y: 0,
              height: isCreateOpen ? "auto" : "auto",
            }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute right-0 mt-2 2xl:w-[20vw] xl:w-[33vw] lg:w-[40vw] md:w-[55vw] sm:w-[60vw] w-[80vw] z-50 bg-[#111111] border border-[#444444] rounded-3xl overflow-hidden shadow-lg"
          >
            <motion.ul
              layout
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="py-2 px-4"
            >
              <li className="mt-2">
                <Link
                  to="/profile"
                  className="flex flex-row items-center gap-4 py-2 px-4 cursor-pointer hover:bg-[#1c1c1c] rounded-lg transition"
                >
                  <Avatar size={70} />
                  <div>
                    <h2 className="font-semibold text-white text-md">
                      {FormatAddress(walletAddress)}
                    </h2>
                    <p className="text-slate-500 text-sm">Open Profile</p>
                  </div>
                </Link>
              </li>

              {/* <li className="border border-[#444444] rounded-lg py-2 px-4 mt-4">
                <span className="text-sm text-slate-500 font-semibold">
                  BALANCE
                </span>
                <div className="flex flex-row items-center gap-4 mt-2 mb-2">
                  <img src="./assets/bnb.svg" alt="bnb" className="w-6 h-6" />
                  <span className="text-white font-semibold text-md">
                    {walletBalance}
                  </span>
                </div>
              </li> */}

              {/* Create Button with Animated Dropdown */}
              <li className="py-2 px-4 mt-4 cursor-pointer hover:bg-[#1c1c1c] transition-all rounded-lg">
                <Link
                  className="flex flex-row items-center justify-between w-full"
                  // onClick={() => setIsCreateOpen(!isCreateOpen)}
                  to="/create-in-collection"
                >
                  <div className="flex flex-row items-center gap-4">
                    <FaPlusCircle className="text-white w-6 h-6" />
                    <span className="text-white text-md">Create NFT</span>
                  </div>
                  {/* <motion.div animate={{ rotate: isCreateOpen ? 90 : 0 }}>
                    <FaAngleRight className="text-white w-4 h-4 transition" />
                  </motion.div> */}
                </Link>
              </li>

              {/* Smooth Expanding Child Dropdown */}
              {/* <AnimatePresence>
                {isCreateOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {dropdownItems.map((item, index) => (
                      <li
                        key={index}
                        className="py-2 px-8 mt-1 cursor-pointer hover:bg-[#1c1c1c] rounded-lg transition-all duration-300 ease-in-out"
                      >
                        <Link to={item.link ? item.link : ""}>
                          <button
                            className="w-full flex flex-row items-center gap-4"
                            onClick={() => {
                              setIsOpen(false);
                              setIsCreateOpen(false);
                            }}
                          >
                            {item.icon}
                            <span className="text-white text-md">
                              {item.label}
                            </span>
                          </button>
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence> */}

              <li className="py-2 px-4 mt-1 cursor-pointer hover:bg-[#1c1c1c] transition rounded-lg">
                <button
                  className="flex flex-row items-center gap-4 w-full"
                  // onClick={() => open({ view: "Account" })}
                  onClick={() => disconnect()}
                >
                  <FaSignOutAlt className="text-white w-6 h-6" />
                  <span className="text-white text-md">Logout</span>
                </button>
              </li>
              <div className="h-[1px] bg-white/30 mt-2"></div>
              <h3 className="text-white/30 text-md mt-2">COMMUNITY</h3>
              <div className="mt-4 flex flex-row items-center justify-between mb-4">
                <Link to="">
                  <Button
                    type="outline"
                    label="Channel"
                    icon={<FaTelegram className="text-white w-5 h-5" />}
                    iconPosition="left"
                    mobileHideLabel={true}
                  />
                </Link>
                <Link to="">
                  <Button
                    type="outline"
                    label="Twitter"
                    icon={<FaTwitter className="text-white w-5 h-5" />}
                    iconPosition="left"
                    mobileHideLabel={true}
                  />
                </Link>
                <Link to="">
                  <Button
                    type="outline"
                    label="Github"
                    icon={<FaGithub className="text-white w-5 h-5" />}
                    iconPosition="left"
                    mobileHideLabel={true}
                  />
                </Link>
              </div>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;

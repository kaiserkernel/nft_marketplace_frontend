import React from "react";
import Button from "../../common/Button";
import { FaFacebook, FaGithub, FaTelegram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router";

const Footer = () => {
  return (
    <div className="px-4 w-full">
      <div className="md:flex flex-row items-start w-full z-50 justify-between pt-2">
        <div>
          <div className="flex items-center gap-2">
            <img src="./assets/logo.png" alt="Logo" className="w-24 h-24" />
            <span className="gradient-text text-xl font-semibold">
              CHALIRE UNICORN AI
            </span>
          </div>
          <div>
            <p className="text-white/30 text-md">
              Welcome to the largest NFT marketplace based on Binance Smart
              Chain.
            </p>
            <p className="text-white/30 text-md mt-2">
              Make yourself at home among other NFT enthusiasts.
            </p>
            <div className="flex flex-row items-center gap-4 mt-4">
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
                  label="Facebook"
                  icon={<FaFacebook className="text-white w-5 h-5" />}
                  iconPosition="left"
                  mobileHideLabel={true}
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="basis-1/3">
          <div className="grid grid-cols-2 md:gap-10 gap-5 md:mt-0 mt-6">
            <div className="flex flex-col items-start">
              <h3 className="text-white font-semibold px-4 mb-4">
                Marketplace
              </h3>
              <Button type="text" label="Brand" />
              <Button type="text" label="For NFT Creators" />
              <Button type="text" label="Terms" />
              <Button type="text" label="Private Policy" />
            </div>
            <div className="">
              <h3 className="text-white font-semibold px-4 mb-4">Contacts</h3>
              <Button type="text" label="Support Bot" />
              <Button type="text" label="Contact us" />
            </div>
          </div>
        </div>
      </div>
      <div className="h-[1px] bg-white/30 w-full md:mt-14 mt-6"></div>
      <div className="flex flex-row items-center justify-between w-full mt-5 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-sm">Based on</span>
          <img src="./assets/bnb-gray.svg" alt="BNB" className="w-4 h-4" />
          <span className="text-white/30 text-sm">BSC</span>
        </div>
        <img
          src="https://getgems.io/_next/static/media/santa.3cbd3f57.gif"
          alt="Icon"
          className="w-10 h-10"
        />
      </div>
    </div>
  );
};

export default Footer;

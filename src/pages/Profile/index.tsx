import React, { useState } from "react";
import Banner from "../../components/common/Banner";
import useWallet from "../../hooks/useWallet";
import { walletAddressFormat } from "../../lib/helper";
import Button from "../../components/common/Button";
import {
  FaDiscord,
  FaInstagram,
  FaPencilAlt,
  FaPlusCircle,
  FaTelegram,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Tabs from "../../components/common/Tabs";
import Collected from "./Collected";
import History from "./History";
import Modal from "../../components/common/Modal";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";

const tabItems = [
  { label: "Collected", content: <Collected /> },
  { label: "History", content: <History /> },
];

const Profile = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { walletAddress } = useWallet();
  const [displayName, setDisplayName] = useState<string>(
    walletAddressFormat(walletAddress)
  );

  const handleEditClick = () => {
    setIsOpen(true);
  };

  const handleModalClick = () => {};

  return (
    <>
      {/* Banner section */}
      <div className="w-full">
        <Banner />
      </div>
      {/* Profile detail section */}
      <div className="w-full px-8 py-14">
        <h3 className="text-white font-semibold text-3xl">
          {walletAddressFormat(walletAddress)}
        </h3>
        <div className="flex flex-row items-center gap-2 mt-2">
          <span className="text-slate-500 text-md">address: </span>
          <span className="text-white text-md font-semibold">
            {walletAddressFormat(walletAddress)}
          </span>
        </div>
        <div className="flex flex-row items-center gap-4 mt-8">
          <Button
            type="primary"
            label="Edit Profile"
            icon={<FaPencilAlt className="text-white" />}
            iconPosition="left"
            onClick={handleEditClick}
          />
          <Button
            type="outline"
            label="Add Links"
            icon={<FaPlusCircle className="text-white" />}
            iconPosition="left"
            onClick={handleEditClick}
          />
        </div>
        {/* Tabs */}
        <div className="w-full mt-8">
          <Tabs items={tabItems} />
        </div>
      </div>

      {/* Modal */}
      <Modal
        title="Edit Profile"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <Banner />
        <div className="w-full">
          <h3 className="text-white font-semibold text-md mt-8">
            Display Name
          </h3>
          <div className="w-full mt-2">
            <InputField
              itemType="default"
              type="text"
              name="displayName"
              placeholder="Display Name"
              bordered
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="h-4"></div>
          <TextArea
            label="Description"
            placeholder="Tell your followers about yourself"
          />
          <div className="mt-4">
            <h3 className="text-white font-semibold text-md mt-8">Links</h3>
            <div className="w-full mt-2">
              <InputField
                itemType="default"
                type="text"
                name="twitter"
                placeholder="twitter.com/"
                icon={<FaTwitter className="text-white" />}
                bordered
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="w-full mt-2">
              <InputField
                itemType="default"
                type="text"
                name="discord"
                placeholder="discord.gg/"
                icon={<FaDiscord className="text-white" />}
                bordered
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="w-full mt-2">
              <InputField
                itemType="default"
                type="text"
                name="telegram"
                placeholder="t.me/"
                icon={<FaTelegram className="text-white" />}
                bordered
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="w-full mt-2">
              <InputField
                itemType="default"
                type="text"
                name="instagram"
                placeholder="instagram.com/"
                icon={<FaInstagram className="text-white" />}
                bordered
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="w-full mt-2">
              <InputField
                itemType="default"
                type="text"
                name="youtube"
                placeholder="youtube.com/"
                icon={<FaYoutube className="text-white" />}
                bordered
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="w-full mt-2">
              <InputField
                itemType="default"
                type="text"
                name="tiktok"
                placeholder="tiktok.com/"
                icon={<FaTiktok className="text-white" />}
                bordered
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-1 w-full p-4">
          <Button
            label={"Save"}
            type="blue"
            width="full"
            onClick={handleModalClick}
          />
        </div>
      </Modal>
    </>
  );
};

export default Profile;

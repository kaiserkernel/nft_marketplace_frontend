import React, { ChangeEvent, useEffect, useState } from "react";
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
import { useAccount } from "wagmi";

import Banner from "../../components/common/Banner";
import Button from "../../components/common/Button";
import Tabs from "../../components/common/Tabs";
import Modal from "../../components/common/Modal";
import InputField from "../../components/common/InputField";
import TextArea from "../../components/common/TextArea";
import { notify } from "../../components/common/Notify";

import { FormatAddress } from "../../utils/FormatAddress";

import Collected from "./Collected";
import History from "./History";
import { fetchUserInfo, register } from "../../services/userService";

const tabItems = [
  { label: "Collected", content: <Collected /> },
  // { label: "History", content: <History /> },
];

interface SocialLinks {
  twitter: string;
  tiktok: string;
  youtube: string;
  instagram: string;
  telegram: string;
  discord: string;
}

interface UserInfo {
  name: string;
  description: string;
  avatar: string;
}

const Profile = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { address } = useAccount();
  const walletAddress = address as string;
  const [displayName, setDisplayName] = useState<string>(
    FormatAddress(walletAddress)
  );
  const [displayDescription, setDisplayDescription] = useState<string>("");
  const [linksInfo, setLinksInfo] = useState<SocialLinks>({
    twitter: "",
    tiktok: "",
    youtube: "",
    instagram: "",
    telegram: "",
    discord: "",
  });
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    description: "",
    avatar: "",
  });
  const [userInfoSocialLinks, setUserInfoSocialLinks] = useState<SocialLinks>({
    twitter: "",
    tiktok: "",
    youtube: "",
    instagram: "",
    telegram: "",
    discord: "",
  });

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEditClick = () => {
    setIsOpen(true);
  };

  const handleChangeLinks = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setLinksInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setIsLoading(true);

    if (!walletAddress) {
      notify("Please check out wallet connection", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("address", walletAddress);
      formData.append("name", displayName);
      formData.append("description", displayDescription);
      formData.append("socialLinks", JSON.stringify(linksInfo));

      if (avatarImageFile) formData.append("avatar", avatarImageFile); // File upload

      const { data } = await register(formData);
      const { name, description, avatar, socialLinks } = data;
      // save user info
      setUserInfo((prev) => ({
        ...prev,
        name,
        description,
        avatar,
      }));
      setUserInfoSocialLinks((prev) => ({
        ...prev,
        ...socialLinks,
      }));

      notify("Profile saved successfully", "success");
      setIsOpen(false);
    } catch (error) {
      console.log(error, "register error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // fetch info
    if (walletAddress) {
      try {
        const fetchInitialUserInfo = async () => {
          const { data } = await fetchUserInfo({ address: walletAddress });

          if (data) {
            const { name, description, avatar, socialLinks } = data;
            setUserInfo((prev) => ({
              ...prev,
              name,
              description,
              avatar,
            }));
            setUserInfoSocialLinks((prev) => ({
              ...prev,
              ...socialLinks,
            }));
          }
        };
        fetchInitialUserInfo();
      } catch (error) {
        console.log(error, "error");
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isOpen) {
      const { name, description, avatar } = userInfo;

      setDisplayName(name);
      setDisplayDescription(description);
      setLinksInfo(userInfoSocialLinks);
      if (avatar) {
        const _imageUrl = process.env.REACT_APP_URL + avatar;
        setAvatarImage(_imageUrl);
      }
    }
  }, [isOpen, userInfo, userInfoSocialLinks]);

  return (
    <>
      {/* Banner section */}
      <div className="w-full">
        <Banner
          setImageFile={setBannerImageFile}
          image={bannerImage}
          setImage={setBannerImage}
          className="h-[40vh]"
        />
      </div>
      {/* Profile detail section */}
      <div className="w-full md:px-8 py-14 sm:px-3 px-2">
        <h3 className="text-white font-semibold text-3xl">
          {FormatAddress(walletAddress)}
        </h3>
        <div className="flex flex-row items-center gap-2 mt-2">
          <span className="text-slate-400 text-md">address: </span>
          <span className="text-white text-md font-semibold">
            {FormatAddress(walletAddress)}
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
        btnLabel="Save"
        btnType="blue"
        btnClick={handleProfileSave}
        btnProcessing={isLoading}
      >
        <Banner
          setImageFile={setAvatarImageFile}
          image={avatarImage}
          setImage={setAvatarImage}
          className="h-[30vh]"
        />
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
            value={displayDescription}
            onChange={(value) => setDisplayDescription(value)}
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
                value={linksInfo.twitter}
                onChange={handleChangeLinks}
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
                value={linksInfo.discord}
                onChange={handleChangeLinks}
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
                value={linksInfo.telegram}
                onChange={handleChangeLinks}
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
                value={linksInfo.instagram}
                onChange={handleChangeLinks}
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
                value={linksInfo.youtube}
                onChange={handleChangeLinks}
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
                value={linksInfo.tiktok}
                onChange={handleChangeLinks}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Profile;

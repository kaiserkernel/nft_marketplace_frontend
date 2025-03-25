export interface CollectionProps {
  _id: string;
  name: string;
  owner: string;
  symbol: string;
  metadataURI: string;
  description?: string;
  image?: string;
  contractAddress: string;
  createdAt: string;
  __v: number;
}

export interface NFTProps {
  _id?: string;
  owner: string;
  tokenId: number;
  tokenURI: string;
  royalty: number;
  createdAt?: string;
  collection?: CollectionProps;
  price?: number;
  lastPrice?: number;
  priceType?: string;
  startBid?: number;
  bidHistory?: [
    {
      bidder: string;
      price: number;
      date: string;
    }
  ];
  bidEndDate?: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: Attribute[];
  currency: "BNB" | "ETH" | "tBNB";
  ownerName?: string;
}

interface Attribute {
  trait: string;
  value: string | number;
}

export interface NFTMetaData {
  name: string;
  description: string;
  image: string;
  attributes?: Attribute[];
}

export interface ItemGroupList {
  label: string;
  checked: boolean;
  value: string;
}

export const CurrencyType = ["BNB", "ETH", "tBNB"];

export interface SocialLinks {
  twitter: string;
  tiktok: string;
  youtube: string;
  instagram: string;
  telegram: string;
  discord: string;
}

export interface UserInfo {
  name: string;
  description: string;
  avatar: string;
  banner: string;
}

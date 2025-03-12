export interface CollectionProps {
    _id: string,
    name: string,
    owner: string,
    symbol: string,
    metadataURI: string,
    description?: string,
    image?: string,
    contractAddress: string,
    createdAt: string,
    __v: number
}

export interface NFTProps {
    _id?: string,
    owner: string
    tokenId: number,
    tokenURI: string,
    royalty: number,
    createdAt?: string,
    collection?: CollectionProps
}
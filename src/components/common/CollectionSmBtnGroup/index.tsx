import React, { useEffect, useState } from 'react'
import { CollectionProps } from '../../../types';

interface CollectionBtnProps {
    collections: CollectionProps[],
    setSelectedCollection: React.Dispatch<React.SetStateAction<string | null>>;
}

interface CollectionData {
    _id: string,
    name: string,
    description: string,
    image: string,
    symbol: string,
    createdAt: string
}

interface MetaData {
    description: string,
    image: string
}

const CollectionBtn: React.FC<CollectionBtnProps> = (props) => {
    const { collections, setSelectedCollection } = props;
    const [ collectionList, setCollectionList ] = useState<CollectionData[]>([]);

    useEffect(() => {
        collections.forEach((log) => {
            const fetchMetadataInfo = async () => {
                const response = await fetch(log.metadatURI);
                if (!response.ok) {
                    console.log("error fetch metadata url");
                    
                }
                const data: MetaData = await response.json();
                console.log(response, 'response')
                console.log(data, 'data')
            }

            fetchMetadataInfo();
            // const response = await fetch(log.metadatURI);
            // if (!response.ok) {
            //   throw new Error('Failed to fetch metadata');
            // }
    
        })
    }, [collections]);

    return (
        <>
            Collection Button Group
        </>
    )
}

export default CollectionBtn;
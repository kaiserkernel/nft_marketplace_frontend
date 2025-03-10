import React, { useEffect, useState } from 'react';

import { CollectionProps } from '../../../types';
import { fetchMetaData } from '../../../services/colllectionService';

interface CollectionBtnProps {
  collections: CollectionProps[];
  setSelectedCollection: React.Dispatch<React.SetStateAction<CollectionProps | null>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CollectionBtn: React.FC<CollectionBtnProps> = ({ collections, setSelectedCollection, setIsProcessing }) => {
  const [collectionList, setCollectionList] = useState<CollectionProps[]>([]);
  
  useEffect(() => {
    // Create an async function to fetch metadata
    const fetchMetadataInfo = async () => {
      try {
        // Use Promise.all to fetch metadata for all collections concurrently
        const metadataPromises = collections.map(async (log) => {
          const _uri = log.metadataURI;
          const { data } = await fetchMetaData(_uri);
          const {description, image} = data;
          return { ...log, description, image };
        });

        // Wait for all metadata to be fetched
        const metadataList = await Promise.all(metadataPromises);

        // Filter out any failed fetches (null values)
        const validMetadata = metadataList.filter((data) => data !== null);

        // Update the state with the valid metadata
        setCollectionList(validMetadata as CollectionProps[]);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Call the async function inside useEffect
    fetchMetadataInfo();
  }, [collections]);

  return (
    <div>
      {/* Display the collection button group */}
      <div>
        {collectionList.length > 0 ? (
          collectionList.map((collection) => (
            <button
              key={collection._id}
              onClick={() => setSelectedCollection(collection)}
              className="relative w-32 h-32 group"
            >
                {
                    collection.image && (
                        <div className="relative w-full h-full group rounded-md border-4 border-white border-opacity-30 transition-all duration-500 hover:border-opacity-100 hover:shadow-lg">
                            {/* Image with Hover Blur Effect */}
                            <img 
                                src={collection.image} 
                                alt={collection.name} 
                                className="w-full h-full object-cover transition duration-300 group-hover:blur-sm"
                            />
                            
                            {/* Text Fades in on Hover */}
                            <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold opacity-0 transition duration-300 group-hover:opacity-100">
                                {collection.name}
                            </span>
                        </div>
                    )
                }
            </button>
          ))
        ) : (
          null
        )}
      </div>
    </div>
  );
};

export default CollectionBtn;

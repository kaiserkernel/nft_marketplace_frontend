import axios, { isAxiosError } from "axios";

interface CollectionData {
    name: string;
    symbol: string;
    description: string;
    image: string;
    metadataURI: string;
    owner: string | null;
    contractAddress: string;
  }

const createCollection = async (_collectionData: CollectionData) => {
  try {
    const response = await axios.post("/api/collections", _collectionData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating collection:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create collection");
  }
}

const fetchCollection = () => {

}

export {createCollection, fetchCollection}
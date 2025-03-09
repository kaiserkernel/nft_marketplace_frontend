import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";

interface CollectionData {
    name: string;
    symbol: string;
    metadataURI: string;
    owner: string | null;
    contractAddress: string;
  }

const createCollection = async (_collectionData: CollectionData) => {
  try {
    const response = await axios.post("/api/collection/create", _collectionData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      error.response?.data.msg.map((str: string) => {
        notify(str, "error");
      });
    }
    else
      notify("Error occured. Please try again", "error");
  }
}

const fetchCollection = () => {

}

export {createCollection, fetchCollection}
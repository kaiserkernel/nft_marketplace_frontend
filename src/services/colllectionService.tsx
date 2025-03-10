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

const fetchOwnerCollection = async (owner: string) => {
  try {
    const response = await axios.post("/api/collection/owner", {owner}, {
      headers: { "Content-Type": "application/json" }
    })
    return response.data;
  } catch (error:any) {
    if (isAxiosError(error)) {
      error.response?.data.msg.map((str: string) => {
        notify(str, "error");
      });
    }
    else
      notify("Error occured. Please try again", "error");
  }
}

const fetchMetaData = async (uri: string) => {
  try {
    const response = await axios.post(`/api/collection/metadata`, { uri }, {
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

export {createCollection, fetchOwnerCollection, fetchMetaData}
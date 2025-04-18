import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";
import { axiosInstance } from "../config/axios";

interface CollectionData {
  name: string;
  symbol: string;
  metadataURI: string;
  owner: string | null;
  contractAddress: string;
}

const createCollectionDB = async (_collectionData: CollectionData) => {
  try {
    const response = await axiosInstance.post(
      "/api/collection/create",
      _collectionData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      error.response?.data.msg.map((str: string) => {
        notify(str, "error");
      });
    } else notify("Error occured. Please try again", "error");
  }
};

const fetchOwnerCollection = async (owner: string) => {
  try {
    const response = await axiosInstance.post(
      "/api/collection/owner",
      { owner },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      error.response?.data.msg.map((str: string) => {
        notify(str, "error");
      });
    } else notify("Error occured. Please try again", "error");
  }
};

const fetchAllCollection = async () => {
  try {
    const response = await axiosInstance.post("/api/collection/", {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      error.response?.data.msg.map((str: string) => {
        notify(str, "error");
      });
    } else notify("Error occured. Please try again", "error");
  }
};

export { createCollectionDB, fetchOwnerCollection, fetchAllCollection };

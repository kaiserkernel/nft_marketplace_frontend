import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";
import { axiosInstance } from "../config/axios";

const fetchMetaData = async (uri: string) => {
  try {
    const response = await axiosInstance.post(
      `/api/metaData`,
      { uri },
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

export { fetchMetaData };

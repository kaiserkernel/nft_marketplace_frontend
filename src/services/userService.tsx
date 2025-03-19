import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";

const register = async (_data: any) => {
    try {
      const response = await axios.post("/api/user/register", _data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        error.response?.data.msg.map((str: string) => {
          notify(str, "error");
        });
      }
      else
        notify("Error occured. Please try again", "error");
    }
}

const fetchUserInfo = async (_data: any) => {
    try {
      const response = await axios.post("/api/user/", _data, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        error.response?.data.msg.map((str: string) => {
          notify(str, "error");
        });
      }
      else
        notify("Error occured. Please try again", "error");
    }
}

export { register, fetchUserInfo }
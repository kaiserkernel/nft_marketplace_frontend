import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";

import { NFTProps } from "../types";

const mintNFTDB = async (_data: any) => {
    try {
        const response = await axios.post("/api/nft/mint", _data, {
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

const fetchOwnedNFT =  async (_data: string) => {
  try {
    const response = await axios.post("/api/nft/own", { address: _data }, {
      headers: { "Content-Type": "application/json" }
    })
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

const setNFTPriceDB = async (_data: any) => {
  try {
    const response = await axios.post("/api/nft/price", _data, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.log(error, 'cone')
    if (isAxiosError(error)) {
      error.response?.data.msg.map((str: string) => {
        notify(str, "error");
      });
    }
    else
      notify("Error occured. Please try again", "error");
  }
}

export { mintNFTDB, fetchOwnedNFT, setNFTPriceDB }
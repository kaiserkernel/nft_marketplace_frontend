import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";

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

const setNFTFixedPriceDB = async (_data: any) => {
  try {
    const response = await axios.post("/api/nft/fixed", _data, {
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

const fetchNFTListOfCollection = async (_data: any) => {
  try {
    const response = await axios.post("/api/nft/collection", _data, {
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

const buyNFT = async (_data: any) => {
  try {
    const response = await axios.post("/api/nft/buy", _data, {
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

const setNFTAuctionPriceDB = async (_data: any) => {
  try {
    const response = await axios.post("/api/nft/auction", _data, {
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

const bidToAuctionDB = async (_data: any) => {
  try {
    const response = await axios.post("/api/nft/bid", _data, {
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

export { mintNFTDB, fetchOwnedNFT, setNFTFixedPriceDB, fetchNFTListOfCollection, buyNFT, setNFTAuctionPriceDB, bidToAuctionDB }
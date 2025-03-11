import axios, { isAxiosError } from "axios";
import { notify } from "../components/common/Notify";

import { NFTData } from "../types";

const mintNFTDB = async (_data: NFTData) => {
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

export { mintNFTDB }
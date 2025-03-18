import { parseUnits } from "ethers";

export const FormatToWeiCurrency = (price: number) => {
    return parseUnits(price.toString(), 18);
}
import { parseUnits, formatUnits  } from "ethers";

export const FormatToWeiCurrency = (_price: number) => {
    return parseUnits(_price.toString(), 18);
}

export const FormatToRealCurrency = (_price: number) => {
    return formatUnits(_price, 18);
}
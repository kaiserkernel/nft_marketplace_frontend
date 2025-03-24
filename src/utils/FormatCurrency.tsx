import { parseUnits, formatUnits } from "ethers";

export const FormatToWeiCurrency = (_price: number | string) => {
  return parseUnits(_price.toString(), 18); // Ensure it's a string
};

export const FormatToRealCurrency = (_price: bigint | string) => {
  return formatUnits(BigInt(_price), 18); // Convert to bigint to avoid precision issues
};

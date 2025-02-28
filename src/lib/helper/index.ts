export const walletAddressFormat = (walletAddress: string | null) => {
  if (!walletAddress) {
    return "";
  }
  return `${walletAddress.slice(0, 6)}....${walletAddress.slice(
    walletAddress.length - 5,
    walletAddress.length - 1
  )}`;
};

export const FormatAddress = (address: string | null) => {
    if (!address) {
      return "";
    }
    return `${address.slice(0, 6)}....${address.slice(
      address.length - 5,
      address.length - 1
    )}`;
  };
  
import { notify } from "../components/common/Notify";

export const TransactionErrorhandle = (error: any) => {
  if (error.code === "ACTION_REJECTED") {
    return;
  }

  console.warn(error, "error");

  // Default error message
  let errorMessage = "Transaction failed. Please try again.";

  if (error.reason) {
    errorMessage = error.reason; // Standard Ethers.js error message
  } else if (error.data?.message) {
    errorMessage = error.data.message; // Metamask error message
  } else if (error.message) {
    errorMessage = error.message;
  }

  // Detect insufficient balance errors
  if (
    error.code === "CALL_EXCEPTION" &&
    error.reason === null &&
    error.data === null
  ) {
    errorMessage =
      "Insufficient balance to place this bid. Please check your wallet funds.";
  }

  notify(errorMessage, "error");
};

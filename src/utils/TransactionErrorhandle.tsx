import { notify } from "../components/common/Notify";

export const TransactionErrorhandle = (error: any) => {
    if (error.code === "ACTION_REJECTED") {
        return;
    }

    console.error(error, "error");

    // Default error message
    let errorMessage = "Transaction failed. Please try again.";

    if (error.reason) {
        errorMessage = error.reason; // Standard Ethers.js error message
    } else if (error.data?.message) {
        errorMessage = error.data.message; // Metamask error message
    } else if (error.message) {
        errorMessage = error.message;
    }

    notify(errorMessage, "error");
};

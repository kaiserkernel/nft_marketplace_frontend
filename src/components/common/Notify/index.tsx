import { toast } from "react-toastify";

type ToastStatus = "success" | "info" | "error" | "warning";

export const notify = (msg: string, status: ToastStatus = "info") => {
  const toastMethods = {
    success: toast.success,
    info: toast.info,
    error: toast.error,
    warning: toast.warning
  };

  const notifyFn = toastMethods[status] || toast;
  notifyFn(msg);
};

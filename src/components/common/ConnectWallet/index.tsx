import { FaWallet } from "react-icons/fa";
import { useAppKit } from "@reown/appkit/react";
import Button from "../Button";

const ConnectWallet = () => {
  const { open } = useAppKit();
  return (
    <Button
      type="primary"
      label="Connect Wallet"
      icon={<FaWallet className="text-white" />}
      iconPosition="left"
      onClick={() => open()}
    />
  );
};

export default ConnectWallet;

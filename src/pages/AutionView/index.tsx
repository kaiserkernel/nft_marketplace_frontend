import React from "react";
import { useLocation } from "react-router";

import { NFTProps } from "../../types";

const AuctionView = () => {
    const location = useLocation();
    const nft : NFTProps = location.state || {};

    return (
        <>
        </>
    )
}

export default AuctionView;
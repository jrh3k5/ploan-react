"use client";

import { EthereumAsset } from "@/models/asset";
import { Asset } from "./asset";

export interface AssetAmountProps {
    asset: EthereumAsset
    amount: bigint
}

export function AssetAmount(props: AssetAmountProps) {
    const wholeTokenAmount = props.amount / BigInt(10 ** props.asset.decimals);
    return (
        <span>
            {wholeTokenAmount.toString()} <Asset asset={props.asset} />
        </span>
    );
}
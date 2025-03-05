"use client";

import { EthereumAsset } from "@/models/asset";
import { Asset } from "./asset";
import { formatAssetAmount } from "@/lib/asset_amount";

export interface AssetAmountProps {
  asset: EthereumAsset;
  amount: bigint | string; // have to support string in case this is a result of JSON.stringify
}

export function AssetAmount(props: AssetAmountProps) {
  let amountBigInt = 0n;
  if (typeof props.amount === "string") {
    amountBigInt = BigInt(props.amount);
  } else {
    amountBigInt = props.amount as bigint;
  }
  const formattedAssetAmount = formatAssetAmount(
    amountBigInt,
    props.asset.decimals,
  );
  return (
    <span>
      {formattedAssetAmount} <Asset asset={props.asset} />
    </span>
  );
}

"use client";

import { EthereumAsset } from "@/models/asset";
import { Asset } from "./asset";
import { formatAssetAmount } from "@/lib/format_asset_amount";

export interface AssetAmountProps {
  asset: EthereumAsset;
  amount: bigint;
}

export function AssetAmount(props: AssetAmountProps) {
  const formattedAssetAmount = formatAssetAmount(
    props.amount,
    props.asset.decimals,
  );
  return (
    <span>
      {formattedAssetAmount} <Asset asset={props.asset} />
    </span>
  );
}

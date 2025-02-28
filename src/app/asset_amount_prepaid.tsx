import { EthereumAsset } from "@/models/asset";
import { AssetAmount } from "./asset_amount";

export interface AssetAmountPrepaidProps {
  asset: EthereumAsset;
  amount: bigint;
}

// AssetAmountPrepaid is a component used to show the amount of an asset that has been prepaid
export function AssetAmountPrepaid(props: AssetAmountPrepaidProps) {
  return (
    <span>
      (<AssetAmount amount={props.amount} asset={props.asset} /> prepaid)
    </span>
  );
}

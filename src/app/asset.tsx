import { EthereumAsset } from "@/models/asset";
import { ProcessingAwareProps } from "./processing_aware_props";

export interface AssetProps {
  asset: EthereumAsset;
}

// Asset is a component used to render out a particular asset
export function Asset(props: AssetProps) {
  return <span>{props.asset?.symbol}</span>;
}

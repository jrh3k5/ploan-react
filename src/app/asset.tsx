import { EthereumAsset } from "@/models/asset";

export function Asset(props: { asset: EthereumAsset }) {
  return <span>{props.asset?.symbol}</span>;
}

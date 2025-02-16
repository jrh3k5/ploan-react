import { EthereumAsset } from "../models/asset";

export interface EthereumAssetResolverService {
  getAsset(
    chainId: number,
    contractAddress: string,
  ): Promise<EthereumAsset | undefined>;
}

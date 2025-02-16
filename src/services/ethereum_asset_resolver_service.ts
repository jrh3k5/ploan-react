import { EthereumAsset } from "../models/asset";

export interface EthereumAssetResolverService {
  getAsset(contractAddress: string): Promise<EthereumAsset | null>;
}

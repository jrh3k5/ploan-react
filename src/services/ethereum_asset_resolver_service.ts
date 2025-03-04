import { EthereumAsset } from "../models/asset";

// EthereumAssetResolverService is used to resolve Ethereum assets
export interface EthereumAssetResolverService {
  // getAsset resolves an Ethereum asset by contract address on the given chain.
  getAsset(
    chainId: number,
    contractAddress: string,
  ): Promise<EthereumAsset | undefined>;
}

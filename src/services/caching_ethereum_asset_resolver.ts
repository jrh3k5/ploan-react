import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";
import { EthereumAsset } from "../models/asset";
import { getConfig } from "@/wagmi";

export class CachingEthereumAssetResolver
  implements EthereumAssetResolverService
{
  private cache: Map<string, EthereumAsset> = new Map();
  private underlyingService: EthereumAssetResolverService;

  constructor(underlyingService: EthereumAssetResolverService) {
    this.underlyingService = underlyingService;
  }

  async getAsset(contractAddress: string): Promise<EthereumAsset | undefined> {
    const wagiConfig = getConfig();
    const chainId = wagiConfig.state.chainId;
    const cacheKey = `${chainId}:${contractAddress.toLowerCase()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const asset = await this.underlyingService.getAsset(contractAddress);
    if (asset) {
      this.cache.set(cacheKey, asset);
    }

    return asset;
  }
}

import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";
import { EthereumAsset } from "../models/asset";

export class CachingEthereumAssetResolver
  implements EthereumAssetResolverService
{
  private cache: Map<string, EthereumAsset | undefined> = new Map();
  private underlyingService: EthereumAssetResolverService;

  constructor(underlyingService: EthereumAssetResolverService) {
    this.underlyingService = underlyingService;
  }

  async getAsset(
    chainId: number,
    contractAddress: `0x${string}`,
  ): Promise<EthereumAsset | undefined> {
    const cacheKey = `${chainId}:${contractAddress.toLowerCase()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const asset = await this.underlyingService.getAsset(
        chainId,
        contractAddress,
      );
      if (asset) {
        this.cache.set(cacheKey, asset);
      }

      return asset;
    } catch (e) {
      console.warn(
        "Failed to resolve asset; an empty asset will be cached to prevent future failed lookups",
        e,
      );

      this.cache.set(cacheKey, undefined);

      return undefined;
    }
  }
}

import { EthereumAsset } from "@/models/asset";
import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";

// SupportAssetResolverService is used to resolve the list of supported assets
export interface SupportAssetResolver {
    // getSupportedEthereumAssets gets the list of supported assets
    // on the active Ethereum chain.
    getSupportedEthereumAssets(): Promise<EthereumAsset[]>
}

export class SupportedAssetResolverImpl implements SupportAssetResolver {
    private ethChainSupports: Map<number, string[]> = new Map();
    private ethereumAssetResolverService: EthereumAssetResolverService
    private chainId: number;

    constructor(chainId: number, ethereumAssetResolverService: EthereumAssetResolverService) {
        this.chainId = chainId;
        this.ethereumAssetResolverService = ethereumAssetResolverService;
        
        this.ethChainSupports.set(
            8453,
            ["0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
        );

        this.ethChainSupports.set(
            84532,
            ["0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", "0x036CbD53842c5426634e7929541eC2318f3dCF7e"],
        );
    }

    // getSupportedEthereumAssets gets the list of supported assets
    // on the active Ethereum chain.
    async getSupportedEthereumAssets(): Promise<EthereumAsset[]> {
        if (this.ethChainSupports.has(this.chainId)) {
            const contractAddresses = this.ethChainSupports.get(this.chainId);
            
            const awaitedAssets = await Promise.all(
                contractAddresses!.map(async (address) => {
                
                    const asset = await this.ethereumAssetResolverService.getAsset(this.chainId, address);
                    if (asset) {
                        return asset;
                    }
                    return undefined;
            }));

            return awaitedAssets.filter((asset) => asset !== undefined) as EthereumAsset[];
        }
        return [];
    }

    // setChainId sets the chain ID for which supported assets are to be resolved.
    setChainId(chainId: number) {
        this.chainId = chainId;
    }
}
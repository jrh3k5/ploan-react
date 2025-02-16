import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";
import { EthereumAsset } from "@/models/asset";
import { multicall } from "@wagmi/core";
import { getConfig } from "@/wagmi";
import { Abi } from "viem";

const erc20ABI = [
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
            {
                name: "",
                type: "string"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
            {
                name: "",
                type: "uint8"
            }
        ],
        payable: false,
    stateMutability: "view",
        type: "function"
    },
] as Abi;

export class WagmiEthereumAssetResolverService
  implements EthereumAssetResolverService
{
  async getAsset(contractAddress: string): Promise<EthereumAsset | undefined> {
    const contract = {
      address: contractAddress as `0x${string}`,
      abi: erc20ABI,
    };

    const wagmiConfig = getConfig();

    const chainId = wagmiConfig.state.chainId;

    const data = await multicall(getConfig(), {
        chainId: chainId,
      contracts: [
        {
          ...contract,
          functionName: "symbol",
        },
        {
          ...contract,
          functionName: "decimals",
        },
      ],
    });

    const assetSymbolError = data[0].error;
    let assetSymbol = "";
    if (assetSymbolError) {
        console.warn(`Failed to resolve asset symbol for address: '${contractAddress}' on chain ID ${chainId}; asset symbol will be blank`, assetSymbolError);
    } else [
        assetSymbol = data[0].result?.toString() ?? "",
    ]

    let assetDecimals = 0;

    const assetDecimalsError = data[1].error;
    if (assetDecimalsError) {
        console.warn(`Failed to resolve asset decimals for address: '${contractAddress}' on chain ID ${chainId}; asset decimals will be 0`, assetDecimalsError);
    } else [
        assetDecimals = parseInt(data[1].result?.toString() ?? "0"),
    ]

    return new EthereumAsset(
      chainId,
      assetSymbol,
      assetDecimals,
      contractAddress,
    );
  }
}

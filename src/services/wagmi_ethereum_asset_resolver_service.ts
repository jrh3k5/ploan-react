import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";
import { EthereumAsset } from "@/models/asset";
import { multicall } from "@wagmi/core";
import { Abi } from "viem";
import { getConfig } from "@/wagmi";

const erc20ABI = [
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as Abi;

export class WagmiEthereumAssetResolverService
  implements EthereumAssetResolverService
{
  async getAsset(
    chainId: number,
    contractAddress: `0x${string}`,
  ): Promise<EthereumAsset | undefined> {
    const contract = {
      address: contractAddress as `0x${string}`,
      abi: erc20ABI,
    };

    const data = await multicall(getConfig(), {
      chainId: chainId as 8453 | 84532,
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
      console.warn(
        `Failed to resolve asset symbol for address: '${contractAddress}' on chain ID ${chainId}; asset symbol will be blank`,
        assetSymbolError,
      );

      assetSymbol = "FAILED_TO_RESOLVE";
    } else [(assetSymbol = data[0].result?.toString() ?? "")];

    let assetDecimals = 0;

    const assetDecimalsError = data[1].error;
    if (assetDecimalsError) {
      console.warn(
        `Failed to resolve asset decimals for address: '${contractAddress}' on chain ID ${chainId}; asset decimals will be 0`,
        assetDecimalsError,
      );

      assetDecimals = 0;
    } else [(assetDecimals = parseInt(data[1].result?.toString() ?? "0"))];

    return new EthereumAsset(
      chainId,
      assetSymbol,
      assetDecimals,
      contractAddress,
    );
  }
}

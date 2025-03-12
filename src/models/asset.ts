export class EthereumAsset {
  chainID: number;
  symbol: string;
  decimals: number;
  address: `0x${string}` | undefined;

  constructor(
    chainID: number,
    symbol: string,
    decimals: number,
    address: `0x${string}` | undefined,
  ) {
    this.chainID = chainID;
    this.symbol = symbol;
    this.decimals = decimals;
    this.address = address;
  }
}

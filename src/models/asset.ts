export class EthereumAsset {
    chainID: number;
    symbol: string;
    decimals: number;
    address: string | undefined;

    constructor(
        chainID: number,
        symbol: string,
        decimals: number,
        address: string | undefined
    ) {
        this.chainID = chainID;
        this.symbol = symbol;
        this.decimals = decimals;
        this.address = address;
    }
}
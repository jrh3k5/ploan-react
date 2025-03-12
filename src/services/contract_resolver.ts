import { baseSepolia } from "viem/chains";

// ContractResolver is used to resolve the contract address servicing the application.
export interface ContractResolver {
  // resolveContractAddress returns the contract address for the given chain ID.
  resolveContractAddress(chainId: number): Promise<string>;
}

// InMemoryContractResolver is an in-memory implementation of the ContractResolver interface.
export class InMemoryContractResolver {
  private contractMappings: Map<string, string> = new Map([
    [`${baseSepolia.id}`, "0xEE69dBb8eE67D79Fa6C7fBf86D6dc51eaecb76d4"],
  ]);

  async resolveContractAddress(chainId: number): Promise<string> {
    const mappedAddress = this.contractMappings.get(`${chainId}`);
    if (mappedAddress) {
      return mappedAddress;
    }

    throw new Error(
      `No contract address found for chain ID ${chainId}; available chain IDs are: [${Array.from(this.contractMappings.keys())}]`,
    );
  }
}

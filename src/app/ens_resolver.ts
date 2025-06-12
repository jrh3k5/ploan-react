// This file should ONLY be imported in production, not in tests!
import { getEnsName } from "@wagmi/core";
import { mainnet } from "wagmi/chains";
import { getConfig } from "@/wagmi";

export async function resolveEnsName(address: string): Promise<string | null> {
  return getEnsName(getConfig(), {
    chainId: mainnet.id,
    address: address as `0x${string}`,
  });
}

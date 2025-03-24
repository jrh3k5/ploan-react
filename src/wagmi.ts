import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { mainnet, base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { Chain } from "wagmi/chains";

export function getConfig(): ReturnType<typeof createConfig> {
  return createConfig({
    // add in mainnet support for ENS resolution
    // keep it last, though, to ensure that Base is used by default
    // for now, only support Sepolia
    chains: [base, baseSepolia, mainnet],
    connectors: [injected(), coinbaseWallet()],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}

// getUserSelectableChains gets the chains that a user should be able to select
export function getUserSelectableChains(): Chain[] {
  return [baseSepolia];
}

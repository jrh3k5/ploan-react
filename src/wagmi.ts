import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { mainnet, base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { Chain } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    // add in mainnet support for ENS resolution
    chains: [mainnet, base, baseSepolia],
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
  return [base, baseSepolia];
}

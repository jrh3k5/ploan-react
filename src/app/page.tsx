"use client";

import { useAccount, useDisconnect } from "wagmi";
import { SupportedAssetResolverProvider } from "@/services/supported_asset_resolver_provider";
import { LoanManagement } from "./loan_management";
import { PersonalLoanServiceProvider } from "@/services/personal_loan_service_provider";
import { ChainSelector } from "./chain_selector";
import { InMemoryPersonalLoanService } from "@/services/in_memory_personal_loan_service";
import { WagmiEthereumAssetResolverService } from "@/services/wagmi_ethereum_asset_resolver_service";
import { CachingEthereumAssetResolver } from "@/services/caching_ethereum_asset_resolver";
import { useEffect, useState } from "react";
import { WelcomePage } from "./welcome_page";
import { UserIdentity } from "./user_identity";
import { Identity } from "@/models/identity";
import { SupportedAssetResolverImpl } from "@/services/supported_asset_resolver";
import { defaultChain } from "@/models/chain";

// Declare outside of app so that it's not constantly building new instances
const wagmiResolver = new WagmiEthereumAssetResolverService();
const cachingResolver = new CachingEthereumAssetResolver(wagmiResolver);
const loanService = new InMemoryPersonalLoanService(cachingResolver);
const supportedAssetResolver = new SupportedAssetResolverImpl(cachingResolver);

function App() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  const [chainId, setChainId] = useState<number>(defaultChain.id);

  loanService.setChainId(chainId);
  supportedAssetResolver.setChainId(chainId);

  useEffect(() => {
    if (account.address) {
      console.log("Setting user address", account.address);
      loanService.setUserAddress(account.address);
    }
  }, [account]);

  return (
    <>
      <div className="app">
        {account.status === "connected" ? (
          <div>
            <div className="wallet-info">
              <span className="identity">
                Connected as{" "}
                <UserIdentity identity={new Identity(account.address)} />
              </span>
              <button type="button" onClick={() => disconnect()}>
                Disconnect
              </button>
            </div>

            <PersonalLoanServiceProvider loanService={loanService}>
              <SupportedAssetResolverProvider
                supportedAssetResolver={supportedAssetResolver}
              >
                <LoanManagement chainId={chainId} />
              </SupportedAssetResolverProvider>
            </PersonalLoanServiceProvider>

            <div className="chain-selector">
              Select chain:
              <ChainSelector
                onChainSelection={async (chainId) => {
                  await loanService.setChainId(chainId);

                  setChainId(chainId);
                }}
              />
            </div>
          </div>
        ) : (
          <WelcomePage />
        )}
      </div>
    </>
  );
}

export default App;

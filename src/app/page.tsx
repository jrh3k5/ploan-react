"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectWallet } from "./connect_wallet";
import { LoanManagement } from "./loan_management";
import { PersonalLoanServiceProvider } from "@/services/personal_loan_service_provider";
import { ChainSelector } from "./chain_selector";
import { InMemoryPersonalLoanService } from "@/services/in_memory_personal_loan_service";
import { WagmiEthereumAssetResolverService } from "@/services/wagmi_ethereum_asset_resolver_service";
import { CachingEthereumAssetResolver } from "@/services/caching_ethereum_asset_resolver";

function App() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

    const wagmiResolver = new WagmiEthereumAssetResolverService();
    const cachingResolver = new CachingEthereumAssetResolver(wagmiResolver);
  const loanService = new InMemoryPersonalLoanService(cachingResolver);

  return (
    <>
      <div>
        {account.status === "connected" ? (
          <div>
            <h2>Connected to {account.address}</h2>
            <ChainSelector onChainSelection={() => {
                return loanService.purgeData();
            }} />
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>

            <PersonalLoanServiceProvider loanService={loanService}>
              <LoanManagement />
            </PersonalLoanServiceProvider>
          </div>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </>
  );
}

export default App;

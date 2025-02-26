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
import { InMemoryErrorReporter } from "@/services/error_reporter";
import { ErrorReporterProvider } from "@/services/error_reporter_provider";
import { ErrorMessage } from "./error_message";

// Declare outside of app so that it's not constantly building new instances
const wagmiResolver = new WagmiEthereumAssetResolverService();
const cachingResolver = new CachingEthereumAssetResolver(wagmiResolver);
const loanService = new InMemoryPersonalLoanService(cachingResolver);
const supportedAssetResolver = new SupportedAssetResolverImpl(cachingResolver);
const errorReporter = new InMemoryErrorReporter();

function App() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  const [chainId, setChainId] = useState<number>(defaultChain.id);
  const [userAddress, setUserAddress] = useState<string | undefined>(
    account.address,
  );
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  loanService.setChainId(chainId);
  supportedAssetResolver.setChainId(chainId);

  useEffect(() => {
    if (account.address) {
      loanService.setUserAddress(account.address);
      setUserAddress(account.address);
    }
  }, [account]);

  errorReporter.registerErrorListener(async (error: Error) => {
    console.error(error);

    setCapturedError(error);

    // clear the error from the screen
    setTimeout(() => {
      setCapturedError(undefined);
    }, 5000);
  });

  return (
    <>
      <div className="app">
        {capturedError && <ErrorMessage error={capturedError} />}
        <ErrorReporterProvider errorReporter={errorReporter}>
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
                  <LoanManagement chainId={chainId} userAddress={userAddress} />
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
        </ErrorReporterProvider>
      </div>
    </>
  );
}

export default App;

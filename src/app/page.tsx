"use client";

import {
  useAccount,
  useConfig,
  useDisconnect,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { SupportedAssetResolverProvider } from "@/services/supported_asset_resolver_provider";
import { LoanManagement } from "./loan_management";
import { PersonalLoanServiceProvider } from "@/services/personal_loan_service_provider";
import { ChainSelector } from "./chain_selector";
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
import { InMemoryContractResolver } from "@/services/contract_resolver";
import { OnchainPersonalLoanService } from "@/services/onchain_personal_loan_service";
import { PublicClient, WalletClient } from "viem";
import { switchChain } from "@wagmi/core";
import { ModalContainer, ModalController } from "react-modal-global";
import { Modal } from "@/lib/modal";

// Declare outside of app so that it's not constantly building new instances
const wagmiResolver = new WagmiEthereumAssetResolverService();
const cachingResolver = new CachingEthereumAssetResolver(wagmiResolver);
const contractResolver = new InMemoryContractResolver();
const loanService = new OnchainPersonalLoanService(
  contractResolver,
  cachingResolver,
);
const supportedAssetResolver = new SupportedAssetResolverImpl(cachingResolver);
const errorReporter = new InMemoryErrorReporter();

function App() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  const publicClient = usePublicClient();
  loanService.setPublicClient(publicClient as PublicClient);

  const { data: walletClient } = useWalletClient();
  loanService.setWalletClient(walletClient as WalletClient);

  const [userAddress, setUserAddress] = useState<string | undefined>(
    walletClient?.account.address,
  );
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  const wagmiConfig = useConfig();

  const setActiveChain = async (activeChainId: number) => {
    try {
      await switchChain(wagmiConfig, {
        chainId: activeChainId as 1 | 8453 | 84532,
      });
      supportedAssetResolver.setChainId(activeChainId);
    } catch (error) {
      errorReporter.reportAny(error);
    }
  };

  // Start by setting the default chain
  setActiveChain(defaultChain.id);

  useEffect(() => {
    if (walletClient?.account.address) {
      // only needed for the in-memory implementation
      // loanService.setUserAddress(account.address);
      setUserAddress(walletClient.account.address);
    }
  }, [walletClient?.account.address]);

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
          {account.status === "connected" && walletClient ? (
            <div>
              <div className="wallet-info">
                <span className="identity">
                  Connected as{" "}
                  <UserIdentity
                    identity={new Identity(walletClient!.account.address)}
                  />
                </span>
                <button type="button" onClick={() => disconnect()}>
                  Disconnect
                </button>
              </div>

              <PersonalLoanServiceProvider loanService={loanService}>
                <SupportedAssetResolverProvider
                  supportedAssetResolver={supportedAssetResolver}
                >
                  <LoanManagement
                    chainId={walletClient?.chain?.id}
                    userAddress={userAddress}
                  />
                  <ModalContainer controller={Modal} />
                </SupportedAssetResolverProvider>
              </PersonalLoanServiceProvider>

              <div className="chain-selector">
                Select chain:
                <ChainSelector
                  onChainSelection={async (chainId) =>
                    await setActiveChain(chainId)
                  }
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

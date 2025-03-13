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
import {
  InMemoryErrorReporter,
  registerErrorListener,
} from "@/services/error_reporter";
import { ErrorReporterProvider } from "@/services/error_reporter_provider";
import { ErrorMessage } from "./error_message";
import { InMemoryContractResolver } from "@/services/contract_resolver";
import { OnchainPersonalLoanService } from "@/services/onchain_personal_loan_service";
import { PublicClient, WalletClient } from "viem";
import { switchChain } from "@wagmi/core";
import { ModalContainer } from "react-modal-global";
import { Modal } from "@/lib/modal";
import { InMemoryApplicationStateService } from "@/services/application_state_service";
import { ApplicationStateServiceProvider } from "@/services/application_state_service_provider";
import sdk from "@farcaster/frame-sdk";

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
const appStateService = new InMemoryApplicationStateService();

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  registerErrorListener(errorReporter, setCapturedError);

  appStateService.subscribe(async (state) => {
    await setIsProcessing(state.processing);
  });

  // Set up Farcaster frame
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="app">
        <ApplicationStateServiceProvider appStateService={appStateService}>
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
                      isProcessing={isProcessing}
                    />
                    <ModalContainer controller={Modal} />
                  </SupportedAssetResolverProvider>
                </PersonalLoanServiceProvider>

<div className="footer">
                <div className="chain-selector">
                  Select chain:&nbsp;
                  <ChainSelector
                    onChainSelection={async (chainId) =>
                      await setActiveChain(chainId)
                    }
                    isProcessing={isProcessing}
                  />
                </div>
                <div className="issue-reporter">
                🐛 <a href="https://github.com/jrh3k5/ploan-react/issues" target="_new">Report an Issue</a>
                </div>
                </div>
              </div>
            ) : (
              <WelcomePage />
            )}
          </ErrorReporterProvider>
        </ApplicationStateServiceProvider>
      </div>
    </>
  );
}

export default App;

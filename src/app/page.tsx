"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectWallet } from "./connect_wallet";
import { LoanManagement } from "./loan_management";
import { PersonalLoanServiceProvider } from "@/services/personal_loan_service_provider";
import { ChainSelector } from "./chain_selector";
import { InMemoryPersonalLoanService } from "@/services/in_memory_personal_loan_service";
import { WagmiEthereumAssetResolverService } from "@/services/wagmi_ethereum_asset_resolver_service";
import { CachingEthereumAssetResolver } from "@/services/caching_ethereum_asset_resolver";
import { useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PendingLoan } from "@/models/pending_loan";
import { base } from "wagmi/chains";
import { WelcomePage } from "./welcome_page";
import { UserIdentity } from "./user_identity";
import { Identity } from "@/models/identity";

// Declare outside of app so that it's not constantly building new instances
const wagmiResolver = new WagmiEthereumAssetResolverService();
const cachingResolver = new CachingEthereumAssetResolver(wagmiResolver);
const loanService = new InMemoryPersonalLoanService(base.id, cachingResolver);

function App() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  const [borrowingLoans, setBorrowingLoans] = useState<PersonalLoan[]>([]);
  const [lendingLoans, setLendingLoans] = useState<PersonalLoan[]>([]);
  const [pendingBorrowingLoans, setPendingBorrowingLoans] = useState<
    PendingLoan[]
  >([]);
  const [pendingLendingLoans, setPendingLendingLoans] = useState<PendingLoan[]>(
    [],
  );

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
              <LoanManagement
                borrowingLoans={borrowingLoans}
                lendingLoans={lendingLoans}
                pendingBorrowingLoans={pendingBorrowingLoans}
                pendingLendingLoans={pendingLendingLoans}
                setBorrowingLoans={setBorrowingLoans}
                setLendingLoans={setLendingLoans}
                setPendingBorrowingLoans={setPendingBorrowingLoans}
                setPendingLendingLoans={setPendingLendingLoans}
              />
            </PersonalLoanServiceProvider>

            <div className="chain-selector">
              Select chain:
              <ChainSelector
                onChainSelection={async (chainId) => {
                  await loanService.purgeData();

                  await loanService.setChainId(chainId);

                  const borrowingLoans = await loanService.getBorrowingLoans();
                  setBorrowingLoans(borrowingLoans);

                  const lendingLoans = await loanService.getLendingLoans();
                  setLendingLoans(lendingLoans);

                  const pendingBorrowingLoans =
                    await loanService.getPendingBorrowingLoans();
                  setPendingBorrowingLoans(pendingBorrowingLoans);

                  const pendingLendingLoans =
                    await loanService.getPendingLendingLoans();
                  setPendingLendingLoans(pendingLendingLoans);
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

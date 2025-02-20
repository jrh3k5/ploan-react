"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
  useContext,
  useState,
} from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { createPortal } from "react-dom";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { AssetAmount } from "./asset_amount";
import { ProposeLoanModal } from "./propose_loan_modal";

export interface PendingLendingLoanListProps {
  pendingLoans: PendingLoan[];
  chainId: number;
  userAddress: string | undefined;
  setPendingLoans: Dispatch<SetStateAction<PendingLoan[]>>;
}

export function PendingLendingLoanList(props: PendingLendingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const pendingLoans = props.pendingLoans;
  const userAddress = props.userAddress;
  const setPendingLoans = props.setPendingLoans;

  const [proposeLoanModalVisible, setProposeLoanModalVisible] = useState(false);

  const refreshPendingLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const pendingLoans = await loanService.getPendingLendingLoans();

    setPendingLoans(pendingLoans);
  }, [loanService, setPendingLoans]);

  useEffect(() => {
    refreshPendingLendingLoans().catch((error) => {
      console.error("Failed to refresh pending lending loans", error);
    });
  }, [loanService, refreshPendingLendingLoans, setPendingLoans, userAddress]);

  const cancelLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    await loanService.cancelPendingLoan(loanID);

    await refreshPendingLendingLoans();
  };

  return (
    <div className="loan-grouping">
      <h3>Loans You&apos;ve Offered Others ({pendingLoans.length})</h3>
      <div>
        <button onClick={() => setProposeLoanModalVisible(true)}>
          Propose Loan
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Borrower</th>
            <th>Amount to Lend</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingLoans.map((pendingLoan) => (
            <tr key={pendingLoan.loanID}>
              <td>
                <UserIdentity identity={pendingLoan.borrower} />
              </td>
              <td className="amount">
                <AssetAmount
                  asset={pendingLoan.asset}
                  amount={pendingLoan.amountLoaned}
                />
              </td>
              <td className="actions">
                <button
                  onClick={() => cancelLoan(loanService, pendingLoan.loanID)}
                >
                  Cancel Pending Lend
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {proposeLoanModalVisible &&
        createPortal(
          <ProposeLoanModal
            chainId={props.chainId}
            onClose={async () => setProposeLoanModalVisible(false)}
            onLoanProposal={async () => refreshPendingLendingLoans()}
          />,
          document.body,
        )}
    </div>
  );
}

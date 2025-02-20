"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useContext,
  useState,
} from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { AssetAmount } from "./asset_amount";
import { UserIdentity } from "./user_identity";
import { ProposeLoanAllowlistModal } from "./propose_loan_allowlist_modal";
import { createPortal } from "react-dom";

export interface PendingBorrowingLoanListProps {
  chainId: number;
  userAddress: string | undefined;
  pendingBorrowingLoans: PendingLoan[];
  setPendingBorrowingLoans: Dispatch<SetStateAction<PendingLoan[]>>;
  onAcceptBorrow: (loanID: string) => Promise<void>;
}

export function PendingBorrowingLoanList(props: PendingBorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const pendingBorrowingLoans = props.pendingBorrowingLoans;
  const chainId = props.chainId;
  const userAddress = props.userAddress;
  const setPendingLoans = props.setPendingBorrowingLoans;
  const [showAllowlistModal, setShowAllowlistModal] = useState(false);

  const refreshBorrowingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const pendingLoans = await loanService.getPendingBorrowingLoans();

    setPendingLoans(pendingLoans);
  }, [loanService, setPendingLoans]);

  useEffect(() => {
    refreshBorrowingLoans().catch((error) => {
      console.error("Failed to retrieve pending lending loans", error);
    });
  }, [
    loanService,
    refreshBorrowingLoans,
    setPendingLoans,
    chainId,
    userAddress,
  ]);

  const acceptBorrow = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    await loanService.acceptBorrow(loanID);

    await refreshBorrowingLoans();

    props.onAcceptBorrow(loanID);
  };

  const rejectBorrow = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    await loanService.rejectBorrow(loanID);

    await refreshBorrowingLoans();
  };

  return (
    <div className="loan-grouping">
      <h3>Loans Offered to You ({pendingBorrowingLoans.length})</h3>
      <div>
        <div>
          <button onClick={() => setShowAllowlistModal(true)}>
            Manage Allowlist
          </button>
        </div>
        <div className="contextual-description">
          Only users on your allowlist can propose loans for you to accept
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Lender</th>
            <th>Amount to Borrow</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingBorrowingLoans.map((pendingLoan) => (
            <tr key={pendingLoan.loanID}>
              <td>
                <UserIdentity identity={pendingLoan.lender} />
              </td>
              <td className="amount">
                <AssetAmount
                  asset={pendingLoan.asset}
                  amount={pendingLoan.amountLoaned}
                />
              </td>
              <td className="actions">
                <button onClick={() => acceptBorrow(pendingLoan.loanID)}>
                  Accept Borrow
                </button>
                <button onClick={() => rejectBorrow(pendingLoan.loanID)}>
                  Reject Borrow
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAllowlistModal &&
        createPortal(
          <ProposeLoanAllowlistModal
            chainId={props.chainId}
            userAddress={props.userAddress}
            onClose={async () => setShowAllowlistModal(false)}
          />,
          document.body,
        )}
    </div>
  );
}

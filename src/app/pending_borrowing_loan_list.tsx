"use client";

import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";
import { AssetAmount } from "./asset_amount";
import { UserIdentity } from "./user_identity";
import { ProposeLoanAllowlistModal } from "./propose_loan_allowlist_modal";
import { createPortal } from "react-dom";
import { PendingLoanStatus } from "./pending_loan_status";
import { Identity } from "@/models/identity";

export interface PendingBorrowingLoanListProps {
  allowList: Identity[];
  pendingBorrowingLoans: PendingLoan[];
  onAcceptBorrow: (loanID: string) => Promise<void>;
  onRejectLoan: (loanID: string) => Promise<void>;
  onAllowlistAddition: (identity: Identity) => Promise<void>;
  onAllowlistRemoval: (identity: Identity) => Promise<void>;
}

export function PendingBorrowingLoanList(props: PendingBorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const pendingBorrowingLoans = props.pendingBorrowingLoans;
  const [showAllowlistModal, setShowAllowlistModal] = useState(false);

  const acceptBorrow = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    await loanService.acceptBorrow(loanID);

    await props.onAcceptBorrow(loanID);
  };

  const rejectBorrow = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    await loanService.rejectBorrow(loanID);

    await props.onRejectLoan(loanID);
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
            <th>Status</th>
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
              <td className="status">
                <PendingLoanStatus loan={pendingLoan} />
              </td>
              <td className="actions">
                {pendingLoan.status ==
                  PendingLoanStatusEnum.WAITING_FOR_ACCEPTANCE && (
                  <button onClick={() => acceptBorrow(pendingLoan.loanID)}>
                    Accept Borrow
                  </button>
                )}
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
            allowList={props.allowList}
            onAllowlistAddition={props.onAllowlistAddition}
            onAllowlistRemoval={props.onAllowlistRemoval}
            onClose={async () => setShowAllowlistModal(false)}
          />,
          document.body,
        )}
    </div>
  );
}

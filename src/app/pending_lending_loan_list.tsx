"use client";

import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";
import { createPortal } from "react-dom";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { AssetAmount } from "./asset_amount";
import { ProposeLoanModal } from "./propose_loan_modal";
import { PendingLoanStatus } from "./pending_loan_status";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

export interface PendingLendingLoanListProps {
  pendingLoans: PendingLoan[];
  chainId: number;
  onLoanCancellation: (loanID: string) => Promise<void>;
  onLoanExecution: (loanID: string) => Promise<void>;
  onLoanProposal: () => Promise<void>;
}

// PendingLendingLoanList provides a component to show what offers of loans a user has to other users that have not yet been executed
export function PendingLendingLoanList(props: PendingLendingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

  const pendingLoans = props.pendingLoans;

  const [proposeLoanModalVisible, setProposeLoanModalVisible] = useState(false);

  const cancelLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    try {
      await loanService.cancelPendingLoan(loanID);

      await props.onLoanCancellation(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  };

  const executeLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    try {
      await loanService.executeLoan(loanID);

      await props.onLoanExecution(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
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
            <th>Status</th>
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
              <td className="status">
                <PendingLoanStatus loan={pendingLoan} />
              </td>
              <td className="actions">
                {pendingLoan.status == PendingLoanStatusEnum.ACCEPTED && (
                  <button
                    onClick={() => executeLoan(loanService, pendingLoan.loanID)}
                  >
                    Execute Loan
                  </button>
                )}
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
            onLoanProposal={async () => props.onLoanProposal()}
          />,
          document.body,
        )}
    </div>
  );
}

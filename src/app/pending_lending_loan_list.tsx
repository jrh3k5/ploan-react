"use client";

import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { AssetAmount } from "./asset_amount";
import { ProposeLoanModal } from "./propose_loan_modal";
import { PendingLoanStatus } from "./pending_loan_status";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { Modal } from "@/lib/modal";
import { TokenApproval } from "./token_approval";
import { AssetAmountPrepaid } from "./asset_amount_prepaid";

export interface PendingLendingLoanListProps {
  pendingLoans: PendingLoan[];
  chainId: number | undefined;
  onLoanCancellation: (loanID: string) => Promise<void>;
  onLoanExecution: (loanID: string) => Promise<void>;
  onLoanProposal: () => Promise<void>;
}

// PendingLendingLoanList provides a component to show what offers of loans a user has to other users that have not yet been executed
export function PendingLendingLoanList(props: PendingLendingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

  const pendingLoans = props.pendingLoans;

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

  const showTokenApproval = async (pendingLoan: PendingLoan) => {
    try {
      Modal.open(TokenApproval, {
        onCancel: async () => {},
        onApprove: async () => executeLoan(loanService, pendingLoan.loanID),
        amount: `${pendingLoan.amountLoaned}`,
        asset: pendingLoan.asset,
        recipient: pendingLoan.borrower,
      });
    } catch (error) {
      errorReporter.reportAny(error);
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
        <button
          onClick={() => {
            Modal.open(ProposeLoanModal, {
              chainId: props.chainId,
              onLoanProposal: async () => props.onLoanProposal(),
              onClose: async () => {},
            });
          }}
        >
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
              <td className="address-container">
                <UserIdentity identity={pendingLoan.borrower} />
              </td>
              <td className="amount">
                <AssetAmount
                  asset={pendingLoan.asset}
                  amount={pendingLoan.amountLoaned}
                />
                {pendingLoan.imported && (
                  <AssetAmountPrepaid
                    asset={pendingLoan.asset}
                    amount={pendingLoan.amountPaid}
                  />
                )}
              </td>
              <td className="status">
                <PendingLoanStatus loan={pendingLoan} />
              </td>
              <td className="actions">
                {pendingLoan.status == PendingLoanStatusEnum.ACCEPTED && (
                  <button
                    onClick={() => {
                      if (pendingLoan.imported) {
                        return executeLoan(loanService, pendingLoan.loanID);
                      }

                      return showTokenApproval(pendingLoan);
                    }}
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
    </div>
  );
}

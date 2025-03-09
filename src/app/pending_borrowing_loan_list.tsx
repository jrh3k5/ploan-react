"use client";

import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";
import { AssetAmount } from "./asset_amount";
import { UserIdentity } from "./user_identity";
import { ProposeLoanAllowlistModal } from "./modal/propose_loan_allowlist_modal";
import { PendingLoanStatus } from "./pending_loan_status";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { Modal } from "@/lib/modal";
import { AssetAmountPrepaid } from "./asset_amount_prepaid";
import { ProcessingAwareProps } from "./processing_aware_props";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";

export interface PendingBorrowingLoanListProps extends ProcessingAwareProps {
  chainId: number | undefined;
  pendingBorrowingLoans: PendingLoan[];
  userAddress: string | undefined;
  onAcceptBorrow: (loanID: string) => Promise<void>;
  onRejectLoan: (loanID: string) => Promise<void>;
}

// PendingBorrowingLoanList provides a component to show what offers of loans to the user has received that have not yet been executed
export function PendingBorrowingLoanList(props: PendingBorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const appStateService = useContext(ApplicationStateServiceContext);

  const pendingBorrowingLoans = props.pendingBorrowingLoans;

  const acceptBorrow = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "pending_borrowing_loan_list:acceptBorrow",
    );
    try {
      await loanService.acceptBorrow(loanID);

      await props.onAcceptBorrow(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  const rejectBorrow = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "pending_borrowing_loan_list:rejectBorrow",
    );
    try {
      await loanService.rejectBorrow(loanID);

      await props.onRejectLoan(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <div className="loan-grouping">
      <h3>Loans Offered to You ({pendingBorrowingLoans.length})</h3>
      <div>
        <div>
          <button
            disabled={props.isProcessing}
            onClick={() =>
              Modal.open(ProposeLoanAllowlistModal, {
                chainId: props.chainId,
                onClose: async () => {},
                userAddress: props.userAddress,
              })
            }
          >
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
              <td className="address-container">
                <UserIdentity identity={pendingLoan.lender} />
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
                {pendingLoan.status ==
                  PendingLoanStatusEnum.WAITING_FOR_ACCEPTANCE && (
                  <button
                    onClick={() => acceptBorrow(pendingLoan.loanID)}
                    disabled={props.isProcessing}
                  >
                    Accept Offer
                  </button>
                )}
                <button
                  onClick={() => rejectBorrow(pendingLoan.loanID)}
                  disabled={props.isProcessing}
                >
                  Reject Offer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

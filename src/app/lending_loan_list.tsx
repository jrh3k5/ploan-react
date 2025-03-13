"use client";

import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { compareByStatus, PersonalLoan } from "@/models/personal_loan";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { ProcessingAwareProps } from "./processing_aware_props";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { Modal } from "@/lib/modal";
import { DeleteLoanModal } from "./modal/delete_loan_modal";

// LendingLoanListProps describes the properties needed by the lending loan list.
export interface LendingLoanListProps extends ProcessingAwareProps {
  lendingLoans: PersonalLoan[];
  onLoanCancelation: (loanID: string) => Promise<void>;
  onLoanDeletion: (loanID: string) => Promise<void>; // invoked upon deletion of a loan
}

// LendingLoanList displays a list of loans that the user is the lender for
export function LendingLoanList(props: LendingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const lendingLoans = props.lendingLoans;

  const cancelLoan = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "lending_loan_list:cancelLoan",
    );

    try {
      await loanService.cancelLendingLoan(loanID);

      await props.onLoanCancelation(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  const openLoanDeletionModal = (loan: PersonalLoan) => {
    Modal.open(DeleteLoanModal, {
      loan: loan,
      onDeletion: async () => {
        await props.onLoanDeletion(loan.loanID);
      },
    });
  };

  return (
    <div className="loan-grouping">
      <h3>Loans Owed to You ({lendingLoans.length})</h3>
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
          {lendingLoans.sort(compareByStatus).map((lendingLoan) => (
            <tr key={lendingLoan.loanID}>
              <td className="address-container">
                <UserIdentity identity={lendingLoan.borrower} />
              </td>
              <td>
                <LoanProgress loan={lendingLoan} />
              </td>
              <td className="status">
                <LoanStatus loan={lendingLoan} />
              </td>
              <td className="actions">
                {lendingLoan.status === LoanStatusEnum.IN_PROGRESS && (
                  <button
                    disabled={props.isProcessing}
                    onClick={() => cancelLoan(lendingLoan.loanID)}
                  >
                    Cancel
                  </button>
                )}
                {(lendingLoan.status == LoanStatusEnum.CANCELED ||
                  lendingLoan.status === LoanStatusEnum.COMPLETED) && (
                  <button
                    onClick={() => openLoanDeletionModal(lendingLoan)}
                    disabled={props.isProcessing}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { ProcessingAwareProps } from "./processing_aware_props";

// LendingLoanListProps describes the properties needed by the lending loan list.
export interface LendingLoanListProps extends ProcessingAwareProps {
  lendingLoans: PersonalLoan[];
  onLoanCancelation: (loanID: string) => Promise<void>;
}

// LendingLoanList displays a list of loans that the user is the lender for
export function LendingLoanList(props: LendingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const lendingLoans = props.lendingLoans;

  const cancelLoan = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    try {
      await loanService.cancelLendingLoan(loanID);

      await props.onLoanCancelation(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
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
          {lendingLoans.map((lendingLoan) => (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

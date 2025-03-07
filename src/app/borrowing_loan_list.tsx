"use client";

import { useContext, useState } from "react";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { LoanRepaymentModal } from "./loan_repayment_modal";
import { Modal } from "@/lib/modal";
import { TokenApproval } from "./token_approval";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ProcessingAwareProps } from "./processing_aware_props";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";

// BorrowingLoanListProps describes the properties required by BorrowingLoanList
export interface BorrowingLoanListProps extends ProcessingAwareProps {
  borrowingLoans: PersonalLoan[]; // the loans to be shown
  onPaymentSubmission: (loanID: string) => Promise<void>; // invoked upon submission of payment for a loan
}

// BorrowingLoanList shows the user what loans they are the borrower on
export function BorrowingLoanList(props: BorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const appStateService = useContext(ApplicationStateServiceContext);

  const openRepaymentModal = (loan: PersonalLoan) => {
    Modal.open(LoanRepaymentModal, {
      loan: loan,
      onClose: async () => {},
      onPaymentSubmission: async (repaymentAmount: bigint) => {
        await showTokenApproval(loan, repaymentAmount);
      },
    });
  };

  const showTokenApproval = async (loan: PersonalLoan, amount: bigint) => {
    Modal.open(TokenApproval, {
      onCancel: async () => {},
      onApprove: async () => submitRepayment(loan, amount),
      amount: `${amount}`,
      asset: loan.asset,
      recipient: loan.lender,
    });
  };

  const submitRepayment = async (
    loan: PersonalLoan,
    repaymentAmount: bigint,
  ) => {
    const token = await appStateService?.startProcessing(
      "borrowing_loan_list:submitRepayment",
    );

    try {
      await loanService?.repayLoan(loan.loanID, repaymentAmount);

      await props.onPaymentSubmission(loan.loanID);
    } catch (error) {
      errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <div className="loan-grouping">
      <h3>Loans You Owe On ({props.borrowingLoans.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Lender</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.borrowingLoans.map((borrowingLoan) => (
            <tr key={borrowingLoan.loanID}>
              <td className="address-container">
                <UserIdentity identity={borrowingLoan.lender} />
              </td>
              <td>
                <LoanProgress loan={borrowingLoan} />
              </td>
              <td className="status">
                <LoanStatus loan={borrowingLoan} />
              </td>
              <td className="actions">
                {borrowingLoan.status == LoanStatusEnum.IN_PROGRESS && (
                  <button
                    onClick={() => openRepaymentModal(borrowingLoan)}
                    disabled={props.isProcessing}
                  >
                    Repay {borrowingLoan.asset.symbol}
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

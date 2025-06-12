"use client";

import { useContext } from "react";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanStatus } from "./loan_status";
import {
  LoanStatus as LoanStatusEnum,
  compareByStatus,
} from "@/models/personal_loan";
import { LoanRepaymentModal } from "./modal/loan_repayment_modal";
import { Modal } from "@/lib/modal";
import { TokenApproval } from "./modal/token_approval_modal";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { ProcessingAwareProps } from "./processing_aware_props";
import { SubmitPaymentModal } from "./modal/submit_payment_modal";
import { DeleteLoanModal } from "./modal/delete_loan_modal";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";

// BorrowingLoanListProps describes the properties required by BorrowingLoanList
export interface BorrowingLoanListProps extends ProcessingAwareProps {
  borrowingLoans: PersonalLoan[]; // the loans to be shown
  onPaymentSubmission: (loanID: string) => Promise<void>; // invoked upon submission of payment for a loan
  onLoanDeletion: (loanID: string) => Promise<void>; // invoked upon deletion of a loan
}

// BorrowingLoanList shows the user what loans they are the borrower on
export function BorrowingLoanList(props: BorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

  const openRepaymentModal = (loan: PersonalLoan) => {
    Modal.open(LoanRepaymentModal, {
      loan: loan,
      onClose: async () => {},
      onPaymentSubmission: async (repaymentAmount: bigint) => {
        if (!loanService) {
          throw new Error(
            "Loan service must be defined in order to submit payment",
          );
        }

        const currentAllowance = await loanService.getApplicationAllowance(
          loan.asset.address!,
        );
        if (currentAllowance < repaymentAmount) {
          await showTokenApproval(loan, repaymentAmount);
        } else {
          await submitRepayment(loan, repaymentAmount);
        }
      },
    });
  };

  const openLoanDeletionModal = (loan: PersonalLoan) => {
    Modal.open(DeleteLoanModal, {
      loan: loan,
      onDeletion: async () => {
        await props.onLoanDeletion(loan.loanID);
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
    try {
      await Modal.open(SubmitPaymentModal, {
        asset: loan.asset,
        amount: `${repaymentAmount}`,
        recipient: loan.lender,
        submitPayment: async (amount: bigint) => {
          await loanService?.repayLoan(loan.loanID, amount);
        },
        onPaymentSubmission: async (_: bigint) => {
          await props.onPaymentSubmission(loan.loanID);
        },
      });
    } catch (error) {
      errorReporter.reportAny(error);
    }
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th className="label">Lender</th>
            <th className="label">Progress</th>
            <th className="label">Status</th>
            <th className="label">Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.borrowingLoans.sort(compareByStatus).map((borrowingLoan) => (
            <tr key={borrowingLoan.loanID}>
              <td className="value">
                <UserIdentity identity={borrowingLoan.lender} />
              </td>
              <td className="value">
                <LoanProgress loan={borrowingLoan} />
              </td>
              <td className="status value">
                <LoanStatus loan={borrowingLoan} />
              </td>
              <td className="actions form-buttons">
                {borrowingLoan.status === LoanStatusEnum.IN_PROGRESS && (
                  <button
                    onClick={() => openRepaymentModal(borrowingLoan)}
                    disabled={props.isProcessing}
                  >
                    Repay {borrowingLoan.asset.symbol}
                  </button>
                )}
                {(borrowingLoan.status == LoanStatusEnum.CANCELED ||
                  borrowingLoan.status === LoanStatusEnum.COMPLETED) && (
                  <button
                    onClick={() => openLoanDeletionModal(borrowingLoan)}
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

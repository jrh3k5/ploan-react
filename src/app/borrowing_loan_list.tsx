"use client";

import { useContext, useState } from "react";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { createPortal } from "react-dom";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { LoanRepaymentModal } from "./loan_repayment_modal";
import { Modal } from "./modal";
import { TokenApproval } from "./token_approval";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";

export interface BorrowingLoanListProps {
  borrowingLoans: PersonalLoan[];
  onPaymentSubmission: (loanID: string) => Promise<void>;
}

export function BorrowingLoanList(props: BorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

  const [repaymentModalVisible, setRepaymentModalVisible] = useState(false);
  const [tokenApprovalVisible, setTokenApprovalVisible] =
    useState<boolean>(false);
  const [repaymentAmount, setRepaymentAmount] = useState<bigint>(0n);
  const [activeRepayingLoan, setActiveRepayingLoan] = useState<PersonalLoan>();

  const openRepaymentModal = (loan: PersonalLoan) => {
    setActiveRepayingLoan(loan);
    setRepaymentModalVisible(true);
  };

  const showTokenApproval = async (amount: bigint) => {
    try {
      setRepaymentAmount(amount);
      setTokenApprovalVisible(true);
    } catch (error) {
      errorReporter.reportAny(error);
    }
  };

  const submitRepayment = async () => {
    try {
      setTokenApprovalVisible(false);

      await loanService?.repayLoan(activeRepayingLoan!.loanID, repaymentAmount);

      await props.onPaymentSubmission(activeRepayingLoan!.loanID);
    } catch (error) {
      errorReporter.reportAny(error);
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
                  <button onClick={() => openRepaymentModal(borrowingLoan)}>
                    Repay {borrowingLoan.asset.symbol}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {repaymentModalVisible &&
        createPortal(
          <Modal onClose={async () => setRepaymentModalVisible(false)}>
            <LoanRepaymentModal
              loan={activeRepayingLoan}
              onClose={async () => setRepaymentModalVisible(false)}
              onPaymentSubmission={async (repaymentAmount: bigint) => {
                await showTokenApproval(repaymentAmount);
              }}
            />
          </Modal>,
          document.body,
        )}
      {tokenApprovalVisible && (
        <Modal onClose={async () => setTokenApprovalVisible(false)}>
          <TokenApproval
            onCancel={async () => {
              setTokenApprovalVisible(false);
            }}
            onApprove={async () => submitRepayment()}
            amount={repaymentAmount}
            asset={activeRepayingLoan!.asset}
            recipient={activeRepayingLoan!.lender}
          ></TokenApproval>
        </Modal>
      )}
    </div>
  );
}

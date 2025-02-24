"use client";

import { useState } from "react";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { createPortal } from "react-dom";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { LoanRepaymentModal } from "./loan_repayment_modal";

export interface BorrowingLoanListProps {
  borrowingLoans: PersonalLoan[];
  onPaymentSubmission: (loanID: string) => Promise<void>;
}

export function BorrowingLoanList(props: BorrowingLoanListProps) {
  const [repaymentModalVisible, setRepaymentModalVisible] = useState(false);
  const [activeRepayingLoan, setActiveRepayingLoan] = useState<PersonalLoan>();

  const openRepaymentModal = (loan: PersonalLoan) => {
    setActiveRepayingLoan(loan);
    setRepaymentModalVisible(true);
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
              <td>
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
          <LoanRepaymentModal
            loan={activeRepayingLoan}
            onClose={async () => setRepaymentModalVisible(false)}
            onPaymentSubmission={props.onPaymentSubmission}
          />,
          document.body,
        )}
    </div>
  );
}

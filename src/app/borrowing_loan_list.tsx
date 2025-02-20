"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { createPortal } from "react-dom";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { LoanRepaymentModal } from "./loan_repayment_modal";

export interface BorrowingLoanListProps {
  chainId: number;
  userAddress: string | undefined;
  borrowingLoans: PersonalLoan[];
  setBorrowingLoans: Dispatch<SetStateAction<PersonalLoan[]>>;
}

export function BorrowingLoanList(props: BorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const chainId = props.chainId;
  const userAddress = props.userAddress;
  const [repaymentModalVisible, setRepaymentModalVisible] = useState(false);
  const [activeRepayingLoan, setActiveRepayingLoan] = useState<PersonalLoan>();

  const setBorrowingLoans = props.setBorrowingLoans;

  const reloadBorrowingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const loans = await loanService.getBorrowingLoans();
    setBorrowingLoans(loans);
  }, [loanService, setBorrowingLoans]);

  useEffect(() => {
    reloadBorrowingLoans().catch((error) => {
      console.error("Failed to retrieve borrowing loans", error);
    });
  }, [
    loanService,
    reloadBorrowingLoans,
    setBorrowingLoans,
    chainId,
    userAddress,
  ]);

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
            onPaymentSubmission={reloadBorrowingLoans}
          />,
          document.body,
        )}
    </div>
  );
}

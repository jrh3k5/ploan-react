"use client";

import { Dispatch, SetStateAction, useEffect, useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanRepaymentForm } from "./loan_repayment_form";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";

export interface BorrowingLoanListProps {
  borrowingLoans: PersonalLoan[];
  setBorrowingLoans: Dispatch<SetStateAction<PersonalLoan[]>>;
}

export function BorrowingLoanList(props: BorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);

  const setBorrowingLoans = props.setBorrowingLoans;

  const reloadBorrowingLoans = async () => {
    if (!loanService) {
      return;
    }

    const loans = await loanService.getBorrowingLoans();
    setBorrowingLoans(loans);
  };

  useEffect(() => {
    if (loanService) {
      loanService
        .getBorrowingLoans()
        .then((retrievedLoans) => {
          setBorrowingLoans(retrievedLoans);
        })
        .catch((error) => {
          console.error("Failed to retrieve borrowing loans", error);
        });
    }
  }, [loanService, setBorrowingLoans]);

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
              <th>
                <LoanStatus loan={borrowingLoan} />
              </th>
              <td className="actions">
                {borrowingLoan.status == LoanStatusEnum.IN_PROGRESS && (
                  <LoanRepaymentForm
                    loan={borrowingLoan}
                    onPaymentSubmission={() => reloadBorrowingLoans()}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

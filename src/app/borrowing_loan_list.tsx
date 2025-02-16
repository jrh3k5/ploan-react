"use client";

import { Dispatch, SetStateAction, useEffect, useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanRepaymentForm } from "./loan_repayment_form";

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

  if (!props.borrowingLoans.length) {
    return <div>You are currently borrowing nothing from others</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Lender</th>
          <th>Amount to Lend</th>
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
            <td>
              <LoanRepaymentForm
                loan={borrowingLoan}
                onPaymentSubmission={() => reloadBorrowingLoans()}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

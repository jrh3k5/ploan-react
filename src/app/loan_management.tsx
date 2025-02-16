"use client";

import { BorrowingLoanList } from "./borrowing_loan_list";
import { LendingLoanList } from "./lending_loan_list";
import { PendingBorrowingLoanList } from "./pending_borrowing_loan_list";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import { useState, useContext } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";

export function LoanManagement() {
  const loanService = useContext(PersonalLoanContext);
  const [borrowingLoans, setBorrowingLoans] = useState<PersonalLoan[]>([]);

  const refreshBorrowingLoans = async () => {
    if (!loanService) {
      return;
    }

    const borrowingLoans = await loanService.getBorrowingLoans();
    setBorrowingLoans(borrowingLoans);
  };

  const onAcceptBorrow = async (loanID: string) => {
    await refreshBorrowingLoans();
  };

  return (
    <div>
      <PendingBorrowingLoanList onAcceptBorrow={onAcceptBorrow} />
      <PendingLendingLoanList />
      <BorrowingLoanList
        borrowingLoans={borrowingLoans}
        setBorrowingLoans={setBorrowingLoans}
      />
      <LendingLoanList />
    </div>
  );
}

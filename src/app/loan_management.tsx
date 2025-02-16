"use client";

import { BorrowingLoanList } from "./borrowing_loan_list";
import { LendingLoanList } from "./lending_loan_list";
import { PendingBorrowingLoanList } from "./pending_borrowing_loan_list";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import { Dispatch, SetStateAction, useContext } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";

type LoanManagementProps = {
  borrowingLoans: PersonalLoan[];
  lendingLoans: PersonalLoan[];
  pendingBorrowingLoans: PendingLoan[];
  pendingLendingLoans: PendingLoan[];
  setBorrowingLoans: Dispatch<SetStateAction<PersonalLoan[]>>;
  setLendingLoans: Dispatch<SetStateAction<PersonalLoan[]>>;
  setPendingBorrowingLoans: Dispatch<SetStateAction<PendingLoan[]>>;
  setPendingLendingLoans: Dispatch<SetStateAction<PendingLoan[]>>;
};

export function LoanManagement(props: LoanManagementProps) {
  const loanService = useContext(PersonalLoanContext);

  const borrowingLoans = props.borrowingLoans;
  const setBorrowingLoans = props.setBorrowingLoans;

  const lendingLoans = props.lendingLoans;
  const setLendingLoans = props.setLendingLoans;

  const pendingBorrowingLoans = props.pendingBorrowingLoans;
  const setPendingBorrowingLoans = props.setPendingBorrowingLoans;

  const pendingLendingLoans = props.pendingLendingLoans;
  const setPendingLendingLoans = props.setPendingLendingLoans;

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
      <PendingBorrowingLoanList
        onAcceptBorrow={onAcceptBorrow}
        pendingBorrowingLoans={pendingBorrowingLoans}
        setPendingBorrowingLoans={setPendingBorrowingLoans}
      />
      <PendingLendingLoanList
        pendingLoans={pendingLendingLoans}
        setPendingLoans={setPendingLendingLoans}
      />
      <BorrowingLoanList
        borrowingLoans={borrowingLoans}
        setBorrowingLoans={setBorrowingLoans}
      />
      <LendingLoanList
        lendingLoans={lendingLoans}
        setLendingLoans={setLendingLoans}
      />
    </div>
  );
}

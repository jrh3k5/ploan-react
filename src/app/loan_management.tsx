"use client";

import { BorrowingLoanList } from "./borrowing_loan_list";
import { LendingLoanList } from "./lending_loan_list";
import { PendingBorrowingLoanList } from "./pending_borrowing_loan_list";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import { useCallback, useContext, useEffect, useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";

type LoanManagementProps = {
  chainId: number;
};

export function LoanManagement(props: LoanManagementProps) {
  const loanService = useContext(PersonalLoanContext);
  const chainId = props.chainId;

  const [borrowingLoans, setBorrowingLoans] = useState<PersonalLoan[]>([]);
  const [lendingLoans, setLendingLoans] = useState<PersonalLoan[]>([]);
  const [pendingBorrowingLoans, setPendingBorrowingLoans] = useState<
    PendingLoan[]
  >([]);
  const [pendingLendingLoans, setPendingLendingLoans] = useState<PendingLoan[]>(
    [],
  );

  const refreshBorrowingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const borrowingLoans = await loanService.getBorrowingLoans();
    setBorrowingLoans(borrowingLoans);
  }, [loanService, setBorrowingLoans]);

  useEffect(() => {
    if (loanService) {
      refreshBorrowingLoans();
    }
  }, [chainId, loanService, refreshBorrowingLoans]);

  const onAcceptBorrow = async (loanID: string) => {
    await refreshBorrowingLoans();
  };

  return (
    <div className="loan-management">
      <PendingBorrowingLoanList
        onAcceptBorrow={onAcceptBorrow}
        pendingBorrowingLoans={pendingBorrowingLoans}
        setPendingBorrowingLoans={setPendingBorrowingLoans}
      />
      <PendingLendingLoanList
        chainId={chainId}
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

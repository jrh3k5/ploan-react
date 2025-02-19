"use client";

import { BorrowingLoanList } from "./borrowing_loan_list";
import { LendingLoanList } from "./lending_loan_list";
import { PendingBorrowingLoanList } from "./pending_borrowing_loan_list";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import { useCallback, useContext, useEffect, useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { Account } from "viem";

type LoanManagementProps = {
  chainId: number;
  userAddress: string | undefined;
};

export function LoanManagement(props: LoanManagementProps) {
  const loanService = useContext(PersonalLoanContext);
  const chainId = props.chainId;
  const userAddress = props.userAddress;

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
  }, [loanService, refreshBorrowingLoans, chainId, userAddress]);

  const onAcceptBorrow = async (loanID: string) => {
    await refreshBorrowingLoans();
  };

  return (
    <div className="loan-management">
      <PendingBorrowingLoanList
        chainId={chainId}
        userAddress={userAddress}
        onAcceptBorrow={onAcceptBorrow}
        pendingBorrowingLoans={pendingBorrowingLoans}
        setPendingBorrowingLoans={setPendingBorrowingLoans}
      />
      <PendingLendingLoanList
        chainId={chainId}
        userAddress={userAddress}
        pendingLoans={pendingLendingLoans}
        setPendingLoans={setPendingLendingLoans}
      />
      <BorrowingLoanList
        chainId={chainId}
        userAddress={userAddress}
        borrowingLoans={borrowingLoans}
        setBorrowingLoans={setBorrowingLoans}
      />
      <LendingLoanList
        chainId={chainId}
        userAddress={userAddress}
        lendingLoans={lendingLoans}
        setLendingLoans={setLendingLoans}
      />
    </div>
  );
}

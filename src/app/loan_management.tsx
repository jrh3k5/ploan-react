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

  const refreshLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const lendingLoans = await loanService.getLendingLoans();
    setLendingLoans(lendingLoans);
  }, [loanService, setLendingLoans]);

  const refreshPendingBorrowLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const pendingBorrowingLoans = await loanService.getPendingBorrowingLoans();
    setPendingBorrowingLoans(pendingBorrowingLoans);
  }, [loanService, setPendingBorrowingLoans]);

  const refreshPendingLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const pendingLendingLoans = await loanService.getPendingLendingLoans();
    setPendingLendingLoans(pendingLendingLoans);
  }, [loanService, setPendingLendingLoans]);

  useEffect(() => {
    refreshBorrowingLoans();
  }, [loanService, refreshBorrowingLoans, chainId, userAddress]);

  useEffect(() => {
    refreshPendingLendingLoans();
  }, [loanService, refreshPendingLendingLoans, chainId, userAddress]);

  useEffect(() => {
    refreshLendingLoans();
  }, [loanService, refreshLendingLoans, chainId, userAddress]);

  const onAcceptBorrow = async (loanID: string) => {
    await refreshBorrowingLoans();
  };

  const onRejectBorrow = async (loanID: string) => {
    await refreshPendingBorrowLoans();
  };

  return (
    <div className="loan-management">
      <PendingBorrowingLoanList
        pendingBorrowingLoans={pendingBorrowingLoans}
        onAcceptBorrow={onAcceptBorrow}
        onRejectLoan={onRejectBorrow}
      />
      <PendingLendingLoanList
        chainId={chainId}
        pendingLoans={pendingLendingLoans}
        onLoanCancellation={refreshPendingLendingLoans}
        onLoanExecution={async () => {
          await Promise.all([
            refreshPendingLendingLoans(),
            refreshLendingLoans(),
          ]);
        }}
        onLoanProposal={refreshPendingLendingLoans}
      />
      <BorrowingLoanList
        borrowingLoans={borrowingLoans}
        onPaymentSubmission={refreshBorrowingLoans}
      />
      <LendingLoanList
        lendingLoans={lendingLoans}
        onLoanCancelation={refreshLendingLoans}
      />
    </div>
  );
}

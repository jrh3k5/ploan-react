"use client";

import { BorrowingLoanList } from "./borrowing_loan_list";
import { LendingLoanList } from "./lending_loan_list";
import { PendingBorrowingLoanList } from "./pending_borrowing_loan_list";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import { useCallback, useContext, useEffect, useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { Identity } from "@/models/identity";

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
  const [loanAllowlist, setLoanAllowlist] = useState<Identity[]>([]);

  const refreshAllowlist = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const allowlist = await loanService.getLoanProposalAllowlist();
    setLoanAllowlist(allowlist);
  }, [loanService, setLoanAllowlist]);

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
    console.log("pendingBorrowLoans", pendingBorrowingLoans);
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
    refreshAllowlist();
  }, [loanService, refreshAllowlist, chainId, userAddress]);

  useEffect(() => {
    refreshBorrowingLoans();
  }, [loanService, refreshBorrowingLoans, chainId, userAddress]);

  useEffect(() => {
    refreshLendingLoans();
  }, [loanService, refreshLendingLoans, chainId, userAddress]);

  useEffect(() => {
    refreshPendingBorrowLoans();
  }, [loanService, refreshPendingBorrowLoans, chainId, userAddress]);

  useEffect(() => {
    refreshPendingLendingLoans();
  }, [loanService, refreshPendingLendingLoans, chainId, userAddress]);

  const onAcceptBorrow = async (loanID: string) => {
    await refreshPendingBorrowLoans();
  };

  const onRejectBorrow = async (loanID: string) => {
    await refreshPendingBorrowLoans();
  };

  return (
    <div className="loan-management">
      <PendingBorrowingLoanList
        allowList={loanAllowlist}
        pendingBorrowingLoans={pendingBorrowingLoans}
        onAcceptBorrow={onAcceptBorrow}
        onRejectLoan={onRejectBorrow}
        onAllowlistAddition={refreshAllowlist}
        onAllowlistRemoval={refreshAllowlist}
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

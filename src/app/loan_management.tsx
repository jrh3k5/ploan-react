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
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { ProcessingAwareProps } from "./processing_aware_props";

export interface LoanManagementProps extends ProcessingAwareProps {
  chainId: number | undefined;
  userAddress: string | undefined;
}

export function LoanManagement(props: LoanManagementProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

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

    try {
      const allowlist = await loanService.getLoanProposalAllowlist();
      setLoanAllowlist(allowlist);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  }, [loanService, setLoanAllowlist, errorReporter]);

  const refreshBorrowingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    try {
      const borrowingLoans = await loanService.getBorrowingLoans();
      setBorrowingLoans(borrowingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  }, [loanService, setBorrowingLoans, errorReporter]);

  const refreshLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    try {
      const lendingLoans = await loanService.getLendingLoans();
      setLendingLoans(lendingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  }, [loanService, setLendingLoans, errorReporter]);

  const refreshPendingBorrowLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    try {
      const pendingBorrowingLoans =
        await loanService.getPendingBorrowingLoans();
      setPendingBorrowingLoans(pendingBorrowingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  }, [loanService, setPendingBorrowingLoans, errorReporter]);

  const refreshPendingLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    try {
      const pendingLendingLoans = await loanService.getPendingLendingLoans();
      setPendingLendingLoans(pendingLendingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  }, [loanService, setPendingLendingLoans, errorReporter]);

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
        isProcessing={props.isProcessing}
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
        isProcessing={props.isProcessing}
      />
      <BorrowingLoanList
        borrowingLoans={borrowingLoans}
        onPaymentSubmission={refreshBorrowingLoans}
        isProcessing={props.isProcessing}
      />
      <LendingLoanList
        lendingLoans={lendingLoans}
        onLoanCancelation={refreshLendingLoans}
        isProcessing={props.isProcessing}
      />
    </div>
  );
}

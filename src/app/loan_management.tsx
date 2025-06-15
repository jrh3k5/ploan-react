"use client";

import { BorrowingLoanList } from "./borrowing_loan_list";
import { LendingLoanList } from "./lending_loan_list";
import { PendingBorrowingLoanList } from "./pending_borrowing_loan_list";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import { useCallback, useContext, useEffect, useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { ProcessingAwareProps } from "./processing_aware_props";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";

export interface LoanManagementProps extends ProcessingAwareProps {
  chainId: number | undefined;
  userAddress: string | undefined;
}

export function LoanManagement(props: LoanManagementProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const appStateService = useContext(ApplicationStateServiceContext);

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

    const token = await appStateService?.startProcessing(
      "loan_management:refreshBorrowingLoans",
    );
    try {
      const borrowingLoans = await loanService.getBorrowingLoans();
      setBorrowingLoans(borrowingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  }, [loanService, setBorrowingLoans, errorReporter, appStateService]);

  const refreshLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "loan_management:refreshLendingLoans",
    );
    try {
      const lendingLoans = await loanService.getLendingLoans();
      setLendingLoans(lendingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  }, [loanService, setLendingLoans, errorReporter, appStateService]);

  const refreshPendingBorrowLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "loan_management:refreshPendingBorrowLoans",
    );
    try {
      const pendingBorrowingLoans =
        await loanService.getPendingBorrowingLoans();
      setPendingBorrowingLoans(pendingBorrowingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  }, [loanService, setPendingBorrowingLoans, errorReporter, appStateService]);

  const refreshPendingLendingLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "loan_management:refreshPendingLendingLoans",
    );
    try {
      const pendingLendingLoans = await loanService.getPendingLendingLoans();
      setPendingLendingLoans(pendingLendingLoans);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  }, [loanService, setPendingLendingLoans, errorReporter, appStateService]);

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
      <section className="card">
        <h2>Loans Offered to You</h2>
        <PendingBorrowingLoanList
          chainId={chainId}
          pendingBorrowingLoans={pendingBorrowingLoans}
          onAcceptBorrow={onAcceptBorrow}
          onRejectLoan={onRejectBorrow}
          isProcessing={props.isProcessing}
          userAddress={userAddress}
        />
      </section>
      <section className="card">
        <h2>Loans You&apos;ve Offered Others</h2>
        <PendingLendingLoanList
          chainId={chainId}
          pendingLoans={pendingLendingLoans}
          onLoanCancellation={async () => {
            await refreshPendingLendingLoans();
          }}
          onLoanExecution={async () => {
            await Promise.all([
              refreshPendingLendingLoans(),
              refreshLendingLoans(),
            ]);
          }}
          onLoanProposal={refreshPendingLendingLoans}
          isProcessing={props.isProcessing}
        />
      </section>
      <section className="card">
        <h2>Loans You Owe On</h2>
        <BorrowingLoanList
          borrowingLoans={borrowingLoans}
          onPaymentSubmission={refreshBorrowingLoans}
          onLoanDeletion={refreshBorrowingLoans}
          isProcessing={props.isProcessing}
        />
      </section>
      <section className="card">
        <h2>Loans Owed to You</h2>
        <LendingLoanList
          lendingLoans={lendingLoans}
          onLoanCancelation={refreshLendingLoans}
          onLoanDeletion={refreshLendingLoans}
          isProcessing={props.isProcessing}
        />
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect, useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { Asset } from "./asset";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";

export interface PendingBorrowingLoanListProps {
  onAcceptBorrow: (loanID: string) => Promise<void>;
}

export function PendingBorrowingLoanList(props: PendingBorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const [pendingBorrowingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

  useEffect(() => {
    if (loanService) {
      loanService
        .getPendingBorrowingLoans()
        .then((pendingLoans) => {
          setPendingLoans(pendingLoans);
        })
        .catch((error) => {
          console.error("Failed to retrieve pending lending loans", error);
        });
    }
  }, [loanService, setPendingLoans]);

  if (!pendingBorrowingLoans.length) {
    return <div>You have no pending loans to be accepted</div>;
  }

  const refreshBorrowingLoans = async (loanService: PersonalLoanService) => {
    if (!loanService) {
      return;
    }

    const pendingLoans = await loanService.getPendingBorrowingLoans();

    setPendingLoans(pendingLoans);
  };

  const acceptBorrow = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    await loanService.acceptBorrow(loanID);

    await refreshBorrowingLoans(loanService);

    props.onAcceptBorrow(loanID);
  };

  const rejectBorrow = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    await loanService.rejectBorrow(loanID);

    await refreshBorrowingLoans(loanService);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Lender</th>
          <th>Amount to Borrow</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pendingBorrowingLoans.map((pendingLoan) => (
          <tr key={pendingLoan.loanID}>
            <td>
              <UserIdentity identity={pendingLoan.lender} />
            </td>
            <td>
              {pendingLoan.amountLoaned.toString()}{" "}
              <Asset asset={pendingLoan.asset} />
            </td>
            <td>
              <button
                onClick={() => acceptBorrow(loanService, pendingLoan.loanID)}
              >
                Accept Borrow
              </button>
              <button
                onClick={() => rejectBorrow(loanService, pendingLoan.loanID)}
              >
                Reject Borrow
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

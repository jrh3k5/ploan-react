"use client";

import { useState, useEffect, useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { Asset } from "./asset";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";

export function PendingLendingLoanList() {
  const loanService = useContext(PersonalLoanContext);
  const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

  useEffect(() => {
    if (loanService) {
      loanService
        .getPendingLendingLoans()
        .then((lendingLoans) => {
          setPendingLoans(lendingLoans);
        })
        .catch((error) => {
          console.error("Failed to retrieve pending lending loans", error);
        });
    }
  }, [loanService, setPendingLoans]);

  if (!pendingLoans.length) {
    return (
      <div>
        You have no pending loans waiting to be accepted by the borrower
      </div>
    );
  }

  const cancelLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    await loanService.cancelPendingLoan(loanID);

    const pendingLoans = await loanService.getPendingLendingLoans();

    setPendingLoans(pendingLoans);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Borrower</th>
          <th>Amount to Lend</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pendingLoans.map((pendingLoan) => (
          <tr key={pendingLoan.loanID}>
            <td>
              <UserIdentity identity={pendingLoan.borrower} />
            </td>
            <td>
              {pendingLoan.amountLoaned.toString()}{" "}
              <Asset asset={pendingLoan.asset} />
            </td>
            <td>
              <button
                onClick={() => cancelLoan(loanService, pendingLoan.loanID)}
              >
                Cancel Pending Lend
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

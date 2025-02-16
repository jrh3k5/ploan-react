"use client";

import { useState, useEffect, useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";

export function LendingLoanList() {
  const loanService = useContext(PersonalLoanContext);
  const [lendingLoans, setLendingLoans] = useState<PersonalLoan[]>([]);

    useEffect(() => {
    if (loanService) {
      loanService
        .getLendingLoans()
        .then((retrievedLoans) => {
          setLendingLoans(retrievedLoans);
        })
        .catch((error) => {
          console.error("Failed to retrieve lending loans", error);
        });
    }
  }, []);

  if (!lendingLoans.length) {
    return <div>You have no loans lent out to others</div>;
  }

  const cancelLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    await loanService.cancelLendingLoan(loanID);

    const lendingLoans = await loanService.getLendingLoans();

    setLendingLoans(lendingLoans);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Borrow</th>
          <th>Amount to Lend</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {lendingLoans.map((lendingLoan) => (
          <tr key={lendingLoan.loanID}>
            <td>
              <UserIdentity identity={lendingLoan.borrower} />
            </td>
            <td>
              <LoanProgress loan={lendingLoan} />
            </td>
            <td>
              <LoanStatus loan={lendingLoan} />
            </td>
            <td>
              {lendingLoan.status === LoanStatusEnum.IN_PROGRESS && (
                <button
                  onClick={() => cancelLoan(loanService, lendingLoan.loanID)}
                >
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

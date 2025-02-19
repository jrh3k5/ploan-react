"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { UserIdentity } from "./user_identity";
import { LoanProgress } from "./loan_progress";
import { PersonalLoan } from "@/models/personal_loan";
import { LoanStatus } from "./loan_status";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { userAgent } from "next/server";

export interface LendingLoanListProps {
  chainId: number;
  userAddress: string | undefined;
  lendingLoans: PersonalLoan[];
  setLendingLoans: Dispatch<SetStateAction<PersonalLoan[]>>;
}

export function LendingLoanList(props: LendingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const lendingLoans = props.lendingLoans;
  const chainId = props.chainId;
  const userAddress = props.userAddress;
  const setLendingLoans = props.setLendingLoans;

  const refreshLoans = useCallback(async () => {
    if (!loanService) {
      return;
    }
    const lendingLoans = await loanService.getLendingLoans();

    setLendingLoans(lendingLoans);
  }, [loanService, setLendingLoans]);

  useEffect(() => {
    refreshLoans().catch((error) => {
      console.error("Failed to retrieve lending loans", error);
    });
  }, [loanService, refreshLoans, setLendingLoans, chainId, userAddress]);

  const cancelLoan = async (loanID: string) => {
    if (!loanService) {
      return;
    }

    await loanService.cancelLendingLoan(loanID);

    await refreshLoans();
  };

  return (
    <div className="loan-grouping">
      <h3>Loans Owed to You ({lendingLoans.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Borrower</th>
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
              <td className="status">
                <LoanStatus loan={lendingLoan} />
              </td>
              <td className="actions">
                {lendingLoan.status === LoanStatusEnum.IN_PROGRESS && (
                  <button onClick={() => cancelLoan(lendingLoan.loanID)}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

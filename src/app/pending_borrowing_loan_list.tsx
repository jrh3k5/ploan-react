"use client";

import { Dispatch, SetStateAction, useEffect, useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { PendingLoan } from "@/models/pending_loan";
import { AssetAmount } from "./asset_amount";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";

export interface PendingBorrowingLoanListProps {
  pendingBorrowingLoans: PendingLoan[];
  setPendingBorrowingLoans: Dispatch<SetStateAction<PendingLoan[]>>;
  onAcceptBorrow: (loanID: string) => Promise<void>;
}

export function PendingBorrowingLoanList(props: PendingBorrowingLoanListProps) {
  const loanService = useContext(PersonalLoanContext);
  const pendingBorrowingLoans = props.pendingBorrowingLoans;
  const setPendingLoans = props.setPendingBorrowingLoans;

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
    <div className="loan-grouping">
      <h3>Loans Offered to You ({pendingBorrowingLoans.length})</h3>
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
              <td className="amount">
                <AssetAmount asset={pendingLoan.asset} amount={pendingLoan.amountLoaned} />
              </td>
              <td className="actions">
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
    </div>
  );
}

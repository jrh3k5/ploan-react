"use client";

import { useContext } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { UserIdentity } from "./user_identity";
import { AssetAmount } from "./asset_amount";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { calculateTokenAmount } from "@/lib/asset_amount";

export interface LoanRepaymentModalProps {
  loan: PersonalLoan | undefined;
  onClose: () => Promise<void>;
  onPaymentSubmission: () => Promise<void>;
}

export function LoanRepaymentModal(props: LoanRepaymentModalProps) {
  const loanService = useContext(PersonalLoanContext);

  if (!props.loan) {
    return (
      <div className="modal">There doesn&apos;t appear to be a loan set</div>
    );
  }

  const submitRepayment = async (
    e: React.FormEvent<HTMLFormElement>,
    loan: PersonalLoan,
  ) => {
    e.preventDefault();

    if (!loanService) {
      console.warn("Unable to submit repayment; no loan service found");
      return;
    }

    const enteredAmount = e.currentTarget.amount.value;
    const wholeAmount = calculateTokenAmount(
      enteredAmount,
      loan.asset.decimals,
    );

    await loanService.repayLoan(loan.loanID, wholeAmount);

    await props.onPaymentSubmission();
    
    await props.onClose();
  };

  const remainingBalance = props.loan.amountLoaned - props.loan.amountRepaid;

  return (
    <div className="modal">
      <h3 className="section-title">Repay Loan</h3>
      <ul className="details">
        <li>
          <span className="label">Lender</span>
          <span className="value">
            <UserIdentity identity={props.loan?.lender} />
          </span>
        </li>
        <li>
          <span className="label">Total Loaned</span>
          <span className="value">
            <AssetAmount
              amount={props.loan.amountLoaned}
              asset={props.loan.asset}
            />
          </span>
        </li>
        <li>
          <span className="label">Total Paid</span>
          <span className="value">
            <AssetAmount
              amount={props.loan.amountRepaid}
              asset={props.loan.asset}
            />
          </span>
        </li>
        <li>
          <span className="label">Remaining Owed</span>
          <span className="value">
            <AssetAmount amount={remainingBalance} asset={props.loan.asset} />
          </span>
        </li>
      </ul>
      <form onSubmit={(e) => submitRepayment(e, props.loan as PersonalLoan)}>
        <label>Repayment Amount:</label>
        <input type="text" name="amount" />
        <div className="form-buttons">
          <button type="submit">
            Submit Repayment
          </button>
          <button onClick={() => props.onClose()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

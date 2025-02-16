"use client";

import { PersonalLoan } from "@/models/personal_loan";
import { useState, useContext, SyntheticEvent } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";

export interface LoanRepaymentFormProps {
  loan: PersonalLoan;
  onPaymentSubmission: () => Promise<void>;
}

export function LoanRepaymentForm(props: LoanRepaymentFormProps) {
  const loanService = useContext(PersonalLoanContext);
  const [showPayAmountInput, setShowPayAmountInput] = useState(false);

  const repayClicked = () => {
    setShowPayAmountInput(true);
  };

  const submitRepayment = async (
    e: SyntheticEvent<HTMLFormElement>,
    loanID: string,
  ) => {
    // don't submit the page
    e.preventDefault();

    if (!loanService) {
      return;
    }

    await loanService.repayLoan(loanID, BigInt(e.currentTarget.amount.value));

    setShowPayAmountInput(false);

    await props.onPaymentSubmission();
  };

  return (
    <div>
      {!showPayAmountInput && (
        <button onClick={() => repayClicked()}>Repay</button>
      )}
      <form
        id="loan-repayment-form-{props.loan.id}"
        onSubmit={(e) => submitRepayment(e, props.loan.loanID)}
      >
        {showPayAmountInput && (
          <div>
            <input type="number" name="amount" />{" "}
            <button>Submit Repayment</button>
          </div>
        )}
      </form>
    </div>
  );
}

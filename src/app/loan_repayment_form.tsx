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

    const splitValue = e.currentTarget.amount.value.split(".");
    let enteredAmount =
      BigInt(splitValue[0]) * BigInt(10 ** props.loan.asset.decimals);
    if (splitValue.length > 1) {
      const enteredPartialTokens = splitValue[1];
      enteredAmount +=
        BigInt(enteredPartialTokens) *
        BigInt(10 ** (props.loan.asset.decimals - enteredPartialTokens.length));
    }

    await loanService.repayLoan(loanID, enteredAmount);

    setShowPayAmountInput(false);

    await props.onPaymentSubmission();
  };

  return (
    <div>
      {!showPayAmountInput && (
        <button onClick={() => repayClicked()}>Repay</button>
      )}
      <form
        onSubmit={(e) => submitRepayment(e, props.loan.loanID)}
        className="loan-repayment-form"
      >
        {showPayAmountInput && (
          <div>
            <input type="text" name="amount" />
            <button>Submit Repayment</button>
          </div>
        )}
      </form>
    </div>
  );
}

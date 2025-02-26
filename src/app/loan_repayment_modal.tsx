"use client";

import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { useContext, useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { UserIdentity } from "./user_identity";
import { AssetAmount } from "./asset_amount";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { calculateTokenAmount } from "@/lib/asset_amount";
import { InputError } from "./input_error";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

export interface LoanRepaymentModalProps {
  loan: PersonalLoan | undefined;
  onClose: () => Promise<void>;
  onPaymentSubmission: (amount: bigint) => Promise<void>;
}

export function LoanRepaymentModal(props: LoanRepaymentModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    reValidateMode: "onChange",
  });

  if (!props.loan) {
    return <div>There doesn&apos;t appear to be a loan set</div>;
  }

  const submitRepayment = async (
    fieldValues: FieldValues,
    loan: PersonalLoan,
  ) => {
    if (!loanService) {
      return;
    }

    try {
      const enteredAmount = fieldValues.amount;
      const wholeAmount = calculateTokenAmount(
        enteredAmount,
        loan.asset.decimals,
      );

      await props.onPaymentSubmission(wholeAmount);

      await props.onClose();
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  };

  const remainingBalance = props.loan.amountLoaned - props.loan.amountRepaid;

  return (
    <>
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
      <form
        onSubmit={handleSubmit((data: FieldValues) =>
          submitRepayment(data, props.loan as PersonalLoan),
        )}
      >
        <label>Repayment Amount:</label>
        <input
          type="text"
          {...register("amount", {
            required: true,
            pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
            min: 0,
            validate: (value: string) => {
              const loan = props.loan as PersonalLoan;
              const repaymentAmount = calculateTokenAmount(
                value,
                loan.asset.decimals,
              );

              return loan.amountRepaid + repaymentAmount <= loan.amountLoaned;
            },
          })}
        />
        {errors.amount && <InputError message="Invalid repayment amount" />}
        <div className="form-buttons">
          <button type="submit">Submit Repayment</button>
          <button onClick={() => props.onClose()}>Cancel</button>
        </div>
      </form>
    </>
  );
}

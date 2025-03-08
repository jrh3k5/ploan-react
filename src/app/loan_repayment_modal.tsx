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
import { useModalWindow } from "react-modal-global";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ErrorReporterProvider } from "@/services/error_reporter_provider";
import {
  InMemoryErrorReporter,
  registerErrorListener,
} from "@/services/error_reporter";
import { ErrorMessage } from "./error_message";

const errorReporter = new InMemoryErrorReporter();

export interface LoanRepaymentModalProps {
  loan: PersonalLoan | undefined;
  onClose: () => Promise<void>;
  onPaymentSubmission: (amount: bigint) => Promise<void>;
}

export function LoanRepaymentModal(props: LoanRepaymentModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const modal = useModalWindow();

  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  registerErrorListener(errorReporter, setCapturedError);

  if (appStateService) {
    appStateService
      .subscribe(async (appState) => {
        setIsProcessing(appState.processing);
      })
      .then((unsubFn) => {
        modal.on("close", async () => {
          await unsubFn();
        });
      });
  }

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

    const token = await appStateService?.startProcessing(
      "loan_repayment_modal:submitRepayment",
    );

    try {
      const enteredAmount = fieldValues.amount;
      const wholeAmount = calculateTokenAmount(
        enteredAmount,
        loan.asset.decimals,
      );

      await props.onPaymentSubmission(wholeAmount);

      await props.onClose();

      // Close the modal so that the user isn't presented the payment modal while signing for payments
      modal.close();
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  const remainingBalance = props.loan.amountLoaned - props.loan.amountRepaid;

  return (
    <div className="popup-layout">
      <ErrorReporterProvider errorReporter={errorReporter}>
        {capturedError && <ErrorMessage error={capturedError} />}
        <h3 className="section-title">Repay Loan</h3>
        <ul className="details">
          <li>
            <span className="label">Lender</span>
            <span className="value address-container">
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
          <li>
            <form
              onSubmit={handleSubmit((data: FieldValues) =>
                submitRepayment(data, props.loan as PersonalLoan),
              )}
            >
              <span className="label">Repayment Amount:</span>
              <span className="value">
                <input
                  disabled={isProcessing}
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

                      return (
                        loan.amountRepaid + repaymentAmount <= loan.amountLoaned
                      );
                    },
                  })}
                />
              </span>
              {errors.amount && (
                <InputError message="Invalid repayment amount" />
              )}
              <div className="form-buttons">
                <button type="submit" disabled={isProcessing}>
                  Submit Repayment
                </button>
                <button
                  disabled={isProcessing}
                  onClick={async () => {
                    modal.close();
                    await props.onClose();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </li>
        </ul>
      </ErrorReporterProvider>
    </div>
  );
}

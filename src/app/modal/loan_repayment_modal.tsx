"use client";

import { useForm, FieldValues } from "react-hook-form";
import { useContext, useState } from "react";
import { PersonalLoan } from "@/models/personal_loan";
import { UserIdentity } from "../user_identity";
import { AssetAmount } from "../asset_amount";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { calculateTokenAmount } from "@/lib/asset_amount";
import { InputError } from "../input_error";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ModalWrapper } from "./modal_wrapper";
import { useModalWindow } from "react-modal-global";

export interface LoanRepaymentModalProps {
  loan: PersonalLoan;
  onClose: () => Promise<void>;
  onPaymentSubmission: (amount: bigint) => Promise<void>;
}

export function LoanRepaymentModal(props: LoanRepaymentModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedError, setCapturedError] = useState<any>(undefined);

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
    } catch (error) {
      setCapturedError(error);
    } finally {
      await token?.complete();
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    reValidateMode: "onChange",
  });

  const remainingBalance = props.loan.amountLoaned - props.loan.amountRepaid;

  const modal = useModalWindow();

  modal.on("close", () => {
    reset();
  });

  if (appStateService) {
    appStateService
      .subscribe(async (appState) => {
        setIsProcessing(appState.processing);
      })
      .then((unsubFn) => {
        modal.on("close", () => {
          unsubFn();
        });
      });
  }

  return (
    <ModalWrapper reportedError={capturedError}>
      <form
        onSubmit={handleSubmit(async (fieldValues) => {
          await submitRepayment(fieldValues, props.loan as PersonalLoan);

          await modal.close();
        })}
      >
        <div>
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
                <AssetAmount
                  amount={remainingBalance}
                  asset={props.loan.asset}
                />
              </span>
            </li>
            <li>
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
            </li>
          </ul>
        </div>
        <div className="form-buttons">
          <button
            disabled={isProcessing}
            onClick={async () => {
              await props.onClose();

              await modal.close();
            }}
          >
            Cancel
          </button>
          <button type-="submit" disabled={isProcessing}>
            Submit Repayment
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

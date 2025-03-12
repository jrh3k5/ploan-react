"use client";

import { PersonalLoan } from "@/models/personal_loan";
import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ModalWrapper } from "./modal_wrapper";
import { AssetAmount } from "../asset_amount";
import { useModalWindow } from "react-modal-global";

export interface DeleteLoanModalProps {
  loan: PersonalLoan;
  onDeletion: () => Promise<void>;
}

export function DeleteLoanModal(props: DeleteLoanModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedError, setCapturedError] = useState<any>(undefined);

  const modal = useModalWindow();

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

  const deleteLoan = async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "delete_loan_modal:deleteLoan",
    );

    try {
      await loanService.deleteLoan(props.loan.loanID);

      await props.onDeletion();

      await modal.close();
    } catch (error) {
      setCapturedError(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <ModalWrapper reportedError={capturedError}>
      <div>
        <p>
          If you delete this loan for{" "}
          <AssetAmount
            amount={props.loan.amountLoaned}
            asset={props.loan.asset}
          />
          , it will be removed from your and the other users&apos; loan lists.
        </p>
        <p>This action cannot be undone. Do you wish to proeed?</p>
        <div className="form-buttons">
          <button
            disabled={isProcessing}
            onClick={async () => {
              await modal.close();
            }}
          >
            Cancel
          </button>
          <button
            disabled={isProcessing}
            onClick={async () => {
              await deleteLoan();
            }}
          >
            Delete Loan
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

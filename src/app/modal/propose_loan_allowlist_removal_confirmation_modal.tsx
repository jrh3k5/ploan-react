"use client";

import { useContext, useState } from "react";
import { Identity } from "@/models/identity";
import { UserIdentity } from "../user_identity";
import { useModalWindow } from "react-modal-global";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ModalWrapper } from "./modal_wrapper";

export interface ProposeLoanAllowlistRemovalConfirmationModalProps {
  toRemove: Identity;
  onRemoval: () => Promise<void>;
}

export function ProposeLoanAllowlistRemovalConfirmation(
  props: ProposeLoanAllowlistRemovalConfirmationModalProps,
) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
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

  const removeAllowedUser = async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "propose_loan_allowlist_removal_confirmation_modal:removeAllowedUser",
    );

    try {
      await loanService.disallowLoanProposal(props.toRemove);

      await props.onRemoval();

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
        Are you sure you want to remove{" "}
        <UserIdentity identity={props.toRemove} /> from the loan allowlist?
        Their loans will continue to be shown here, but they will no longer be
        able to propose new loans to you.
      </div>
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
            await removeAllowedUser();
          }}
        >
          Remove from Allowlist
        </button>
      </div>
    </ModalWrapper>
  );
}

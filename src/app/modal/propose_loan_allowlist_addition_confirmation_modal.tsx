"use client";

import { useContext, useState } from "react";
import { Identity } from "@/models/identity";
import { UserIdentity } from "../user_identity";
import { useModalWindow } from "react-modal-global";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import {
  InMemoryErrorReporter,
  registerErrorListener,
} from "@/services/error_reporter";
import { ErrorMessage } from "../error_message";

const errorReporter = new InMemoryErrorReporter();

export interface ProposeLoanAllowlistAdditionConfirmationModalProps {
  toAdd: Identity;
  onAddition: () => Promise<void>;
}

export function ProposeLoanAllowlistAdditionConfirmation(
  props: ProposeLoanAllowlistAdditionConfirmationModalProps,
) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );
  const modal = useModalWindow();

  registerErrorListener(errorReporter, setCapturedError);

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

  const addToAllowlist = async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "propose_loan_allowlist_addition_confirmation_modal:addToAllowlist",
    );

    try {
      await loanService.allowLoanProposal(props.toAdd);

      await props.onAddition();

      await modal.close();
    } catch (error) {
      errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <div className="popup-layout">
      {capturedError && <ErrorMessage error={capturedError} />}
      <p>
        Are you sure you want to add <UserIdentity identity={props.toAdd} /> to
        the loan allowlist? This will allow them to suggest loans to you.
      </p>
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
            await addToAllowlist();
          }}
        >
          Add to Allowlist
        </button>
      </div>
    </div>
  );
}

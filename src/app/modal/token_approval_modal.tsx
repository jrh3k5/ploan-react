import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";
import { AssetAmount } from "../asset_amount";
import { UserIdentity } from "../user_identity";
import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { useModalWindow } from "react-modal-global";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ErrorReporterProvider } from "@/services/error_reporter_provider";
import {
  InMemoryErrorReporter,
  registerErrorListener,
} from "@/services/error_reporter";
import { ErrorMessage } from "../error_message";

const errorReporter = new InMemoryErrorReporter();

export interface TokenApprovalProps {
  onCancel: () => Promise<void>;
  onApprove: () => Promise<void>;
  asset: EthereumAsset;
  recipient: Identity;
  amount: bigint | string; // have to accept string for cases when JSON.stringify() is used
}

// TokenApproval is a component used to execute an approval of transferring tokens by the application.
export function TokenApproval(props: TokenApprovalProps) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  registerErrorListener(errorReporter, setCapturedError);

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

  const approveTransfer = async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "token_approval:approveTransfer",
    );
    try {
      const amountBigInt = BigInt(props.amount);

      await loanService.approveTokenTransfer(
        props.recipient,
        props.asset,
        amountBigInt,
      );

      modal.close();

      // Manually complete the token so that, when the subsequent
      // send modal is opened, it's not incorreclty kept disabled
      // because of the token approval's processing token
      await token?.complete();

      await props.onApprove();
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <div className="popup-layout">
      <ErrorReporterProvider errorReporter={errorReporter}>
        {capturedError && <ErrorMessage error={capturedError} />}
        <div className="address-container">
          You must first approve the transfer of{" "}
          <AssetAmount amount={props.amount} asset={props.asset} /> to{" "}
          <UserIdentity identity={props.recipient} />. This allows this
          application to transfer the asset from your balance to the recipient
          on your behalf.
        </div>
        <div className="form-buttons">
          <button
            disabled={isProcessing}
            onClick={() => {
              modal.close();
              props.onCancel();
            }}
          >
            Cancel Transfer
          </button>
          <button onClick={() => approveTransfer()} disabled={isProcessing}>
            Approve Transfer
          </button>
        </div>
      </ErrorReporterProvider>
    </div>
  );
}

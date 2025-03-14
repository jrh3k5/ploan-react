import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";
import { AssetAmount } from "../asset_amount";
import { UserIdentity } from "../user_identity";
import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ModalWrapper } from "./modal_wrapper";
import { useModalWindow } from "react-modal-global";

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

  const approveTransfer = async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "token_approval:approveTransfer",
    );
    try {
      const amountBigInt = BigInt(props.amount);

      await loanService.approveTokenTransfer(props.asset, amountBigInt);

      // Manually complete the token so that, when the subsequent
      // send modal is opened, it's not incorreclty kept disabled
      // because of the token approval's processing token
      await token?.complete();

      await props.onApprove();

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
        You must first approve the transfer of{" "}
        <AssetAmount amount={props.amount} asset={props.asset} /> to{" "}
        <UserIdentity identity={props.recipient} />. This allows this
        application to transfer the asset from your balance to the recipient on
        your behalf.
      </div>
      <div className="form-buttons">
        <button
          disabled={isProcessing}
          onClick={async () => {
            await modal.close();
          }}
        >
          Cancel Transfer
        </button>
        <button
          type-="submit"
          onClick={async () => {
            await approveTransfer();

            await modal.close();
          }}
          disabled={isProcessing}
        >
          Approve Transfer
        </button>
      </div>
    </ModalWrapper>
  );
}

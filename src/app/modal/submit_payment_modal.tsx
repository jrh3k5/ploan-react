import { useModalWindow } from "react-modal-global";
import { useContext, useState } from "react";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { AssetAmount } from "../asset_amount";
import { UserIdentity } from "../user_identity";
import { ModalWrapper } from "./modal_wrapper";
import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";

export interface SubmitPaymentModalProps {
  asset: EthereumAsset;
  recipient: Identity;
  amount: string;
  submitPayment: (amount: bigint) => Promise<void>; // the action to be invoked when the user clicks "send payment"
  onPaymentSubmission: (amount: bigint) => Promise<void>; // the action to be taken after the payment has been submitted
}

export function SubmitPaymentModal(props: SubmitPaymentModalProps) {
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

  const submitPayment = async () => {
    const token = await appStateService?.startProcessing(
      "submit_payment_modal:submitPayment",
    );

    try {
      const amountBigInt = BigInt(props.amount);

      await props.submitPayment(amountBigInt);

      await props.onPaymentSubmission(amountBigInt);

      await modal.close();
    } catch (error) {
      setCapturedError(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <ModalWrapper reportedError={capturedError}>
      Clicking &quot;Send&quot; will send send{" "}
      <AssetAmount amount={props.amount} asset={props.asset} /> to{" "}
      <UserIdentity identity={props.recipient} />. Are you sure you wish to do
      this?
      <div className="form-buttons">
        <button disabled={isProcessing} onClick={() => modal.close()}>
          Cancel
        </button>
        <button disabled={isProcessing} onClick={submitPayment}>
          Send
        </button>
      </div>
    </ModalWrapper>
  );
}

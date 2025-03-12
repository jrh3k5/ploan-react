import { useModalWindow } from "react-modal-global";
import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { PersonalLoan } from "@/models/personal_loan";
import { AssetAmount } from "../asset_amount";
import { UserIdentity } from "../user_identity";
import { ModalWrapper } from "./modal_wrapper";

export interface SubmitPaymentModalProps {
  loan: PersonalLoan;
  amount: string;
  onPaymentSubmission: (amount: bigint) => Promise<void>;
}

export function SubmitPaymentModal(props: SubmitPaymentModalProps) {
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

  const submitPayment = async () => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "submit_payment_modal:submitPayment",
    );

    try {
      const amountBigInt = BigInt(props.amount);

      await loanService.repayLoan(props.loan.loanID, amountBigInt);

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
      <AssetAmount amount={props.amount} asset={props.loan.asset} /> to{" "}
      <UserIdentity identity={props.loan.lender} /> for this loan.
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

import { useModalWindow } from "react-modal-global";
import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { PersonalLoan } from "@/models/personal_loan";
import { AssetAmount } from "../asset_amount";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

export interface SubmitPaymentModalProps {
  loan: PersonalLoan;
  amount: string;
  onPaymentSubmission: (amount: bigint) => Promise<void>;
}

export function SubmitPaymentModal(props: SubmitPaymentModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const modal = useModalWindow();

  // TODO: when the user clicks to submit, set the app state to processing
  const submitPayment = async () => {
    if (!loanService) {
      return;
    }

    // Don't set the processing state here because
    // React doesn't like a component updating a parent component
    // on initialization

    try {
      const amountBigInt = BigInt(props.amount);

      await loanService.repayLoan(props.loan.loanID, amountBigInt);

      await props.onPaymentSubmission(amountBigInt);
    } finally {
      // Success or failure, close the modal and let the parent element
      // handle error reporting
      await modal.close();
    }
  };

  submitPayment().catch((error) => {
    errorReporter.reportAny(error);
  });

  // TODO: remove automatic submissions, as them failing seems to cause them
  // to queue up indefinitely
  return (
    <div className="popup-layout">
      You will now be prompted automatically to sign a transaction to send{" "}
      <AssetAmount amount={props.amount} asset={props.loan.asset} /> to the
      lender for this loan.
      <p />
      This modal will close automatically after completion or failure of the
      payment submission.
    </div>
  );
}

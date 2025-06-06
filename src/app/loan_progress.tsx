import { formatAssetAmount } from "@/lib/asset_amount";
import { PersonalLoan } from "@/models/personal_loan";
import { ProcessingAwareProps } from "./processing_aware_props";

// LoanProgressProps describes the properties needed by the LoanProgress component.
export interface LoanProgressProps {
  loan: PersonalLoan;
}

// LoanProgress is a progress bar showing how much a loan has been repaid
export function LoanProgress(props: LoanProgressProps) {
  const progressRatioBigInt =
    (props.loan.amountRepaid * 100n * (2n ** 53n - 1n)) /
    (props.loan.amountLoaned * (2n ** 53n - 1n));
  const progressRatioString = progressRatioBigInt.toString();
  const progressPercentage = parseFloat(progressRatioString);

  const formattedAmountRepaid = formatAssetAmount(
    props.loan.amountRepaid,
    props.loan.asset.decimals,
  );
  const formattedAmountLoaned = formatAssetAmount(
    props.loan.amountLoaned,
    props.loan.asset.decimals,
  );

  const title = `${progressPercentage}% (${formattedAmountRepaid} / ${formattedAmountLoaned} ${props.loan.asset.symbol})`;

  return (
    <span>
      <progress value={progressPercentage / 100} title={title}></progress>
    </span>
  );
}

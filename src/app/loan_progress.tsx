import { PersonalLoan } from "@/models/personal_loan";
import { useEffect } from "react";

export function LoanProgress(props: { loan: PersonalLoan }) {
  const progressRatioBigInt =
    (props.loan.amountRepaid * 100n * (2n ** 53n - 1n)) /
    (props.loan.amountLoaned * (2n ** 53n - 1n));
  const progressRatioString = progressRatioBigInt.toString();
  const progressPercentage = parseFloat(progressRatioString);

  const formattedAmountRepaid =
    props.loan.amountRepaid / BigInt(10 ** props.loan.asset.decimals);
  const formattedAmountLoaned =
    props.loan.amountLoaned / BigInt(10 ** props.loan.asset.decimals);

  const title = `${progressPercentage}% (${formattedAmountRepaid} / ${formattedAmountLoaned} ${props.loan.asset.symbol})`;

  return (
    <span>
      <progress value={progressPercentage / 100} title={title}></progress>
    </span>
  );
}

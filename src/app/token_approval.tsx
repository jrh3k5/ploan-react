import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";
import { AssetAmount } from "./asset_amount";
import { UserIdentity } from "./user_identity";
import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

export interface TokenApprovalProps {
  onCancel: () => Promise<void>;
  onApprove: () => Promise<void>;
  asset: EthereumAsset;
  recipient: Identity;
  amount: bigint;
}

// TokenApproval is a component used to execute an approval of transferring tokens by the application.
export function TokenApproval(props: TokenApprovalProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);

  const approveTransfer = async () => {
    if (!loanService) {
      return;
    }

    try {
      await loanService.approveTokenTransfer(
        props.recipient,
        props.asset,
        props.amount,
      );

      await props.onApprove();
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  };

  return (
    <>
      <div>
        You must first approve the transfer of{" "}
        <AssetAmount amount={props.amount} asset={props.asset} /> to{" "}
        <UserIdentity identity={props.recipient} />. This allows this
        application to transfer the asset from your balance to the recipient on
        your behalf.
      </div>
      <div className="form-buttons">
        <button onClick={() => props.onCancel()}>Cancel Transfer</button>
        <button onClick={() => approveTransfer()}>Approve Transfer</button>
      </div>
    </>
  );
}

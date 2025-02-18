"use client";

import { SupportAssetResolver } from "@/services/supported_asset_resolver";


export interface ProposeLoanModalProps {
  onClose: () => Promise<void>;
  onLoanProposal: () => Promise<void>;
  supportedAssetResolver: SupportAssetResolver,
}

export function ProposeLoanModal(props: ProposeLoanModalProps) {
  return (
    <div className="modal">
      <h3 className="section-title">Propose Loan</h3>
      <ul className="details">
        <li>
            <span className="label">Borrower</span>
            <span className="value">
                <input name="borrower" type="text" />
            </span>
        </li>
        <li>
            <span className="label">Asset</span>
            <span className="value"></span>
            </li>
      </ul>
    </div>
  );
}

"use client";

import { useContext, useEffect, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { SupportedAssetResolverContext } from "@/services/supported_asset_resolver_provider";
import { EthereumAsset } from "@/models/asset";
import { calculateTokenAmount } from "@/lib/asset_amount";

export interface ProposeLoanModalProps {
  chainId: number;
  onClose: () => Promise<void>;
  onLoanProposal: () => Promise<void>;
}

export function ProposeLoanModal(props: ProposeLoanModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const supportedAssetResolver = useContext(SupportedAssetResolverContext);
  const chainId = props.chainId;

  const [supportedAssets, setSupportedAssets] = useState<EthereumAsset[]>([]);

  useEffect(() => {
    if (!supportedAssetResolver) {
      setSupportedAssets([]);

      return;
    }

    supportedAssetResolver
      .getSupportedEthereumAssets()
      .then((assets) => {
        setSupportedAssets(assets);
      })
      .catch((error) => {
        console.error("Failed to retrieve supported assets", error);
      });
  }, [chainId, supportedAssetResolver]);

  const proposeLoan = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!loanService) {
        console.warn("Cannot propose loan; loan service not yet set");

        return;
    }

    const chosenAssetAddress = e.currentTarget.asset.value;
    const chosenAsset = supportedAssets.find(
      (asset) => asset.address === chosenAssetAddress,
    );
    if (!chosenAsset) {
        console.error("Failed to find chosen asset for contract address among supported assets: ", chosenAssetAddress);

        return;
    }

    const tokenAmount = calculateTokenAmount(e.currentTarget.amount.value, chosenAsset.decimals);

    await loanService.proposeLoan(
      e.currentTarget.borrower.value,
      tokenAmount,
      e.currentTarget.asset.value,
    );

    await props.onLoanProposal();

    await props.onClose();
  };

  return (
    <div className="modal">
      <form onSubmit={(e) => proposeLoan(e)}>
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
            <span className="value">
              <select name="asset">
                {supportedAssets
                  .sort((a, b) => a.symbol.localeCompare(b.symbol))
                  .map((asset) => {
                    return (
                      <option key={asset.address} value={asset.address}>
                        {asset.symbol}
                      </option>
                    );
                  })}
              </select>
            </span>
          </li>
          <li>
            <span className="label">Amount</span>
            <span className="value">
              <input name="amount" type="text" />
            </span>
          </li>
        </ul>
        <div className="form-buttons">
          <button type="submit">Propose</button>
          <button type="button" onClick={() => props.onClose()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

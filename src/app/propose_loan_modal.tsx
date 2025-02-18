"use client";

import { useContext, useEffect, useState } from "react";
import { SupportAssetResolver } from "@/services/supported_asset_resolver";
import { SupportedAssetResolverContext } from "@/services/supported_asset_resolver_provider";
import { EthereumAsset } from "@/models/asset";
import { Asset } from "./asset";

export interface ProposeLoanModalProps {
  chainId: number;
  onClose: () => Promise<void>;
  onLoanProposal: () => Promise<void>;
}

export function ProposeLoanModal(props: ProposeLoanModalProps) {
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

  const proposeLoan = (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    return props.onLoanProposal();
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

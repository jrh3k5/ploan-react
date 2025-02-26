"use client";

import { InputError } from "./input_error";
import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
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
        // Sort the assets so they are displayed in a consistent order
        const sortedAssets = assets.sort((a, b) =>
          a.symbol.localeCompare(b.symbol),
        );
        setSupportedAssets(sortedAssets);
      })
      .catch((error) => {
        console.error("Failed to retrieve supported assets", error);
      });
  }, [chainId, supportedAssetResolver]);

  const proposeLoan = async (fieldValues: FieldValues): Promise<void> => {
    console.log("Proposing loan", fieldValues);

    if (!loanService) {
      console.warn("Cannot propose loan; loan service not yet set");

      return;
    }

    if (supportedAssets.length === 0) {
      console.warn("Cannot propose loan; no supported assets found");

      return;
    }

    let chosenAssetAddress = fieldValues.asset;
    if (!chosenAssetAddress) {
      // The form won't fill in a value on load, so assume it's the first supported asset
      chosenAssetAddress = supportedAssets[0].address as string;
    }

    const chosenAsset = supportedAssets.find(
      (asset) => asset.address === chosenAssetAddress,
    );
    if (!chosenAsset) {
      console.error(
        "Failed to find chosen asset for contract address among supported assets: ",
        chosenAssetAddress,
      );

      return;
    }

    const tokenAmount = calculateTokenAmount(
      fieldValues.amount,
      chosenAsset.decimals,
    );

    await loanService.proposeLoan(
      fieldValues.borrower,
      tokenAmount,
      chosenAssetAddress,
    );

    await props.onLoanProposal();

    await props.onClose();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    reValidateMode: "onChange",
  });

  return (
    <div className="modal">
      <form onSubmit={handleSubmit(proposeLoan)}>
        <h3 className="section-title">Propose Loan</h3>
        <ul className="details">
          <li>
            <span className="label">Borrower</span>
            <span className="value">
              <input
                type="text"
                {...register("borrower", {
                  required: true,
                  pattern: /^0x[a-fA-F0-9]{40}$/,
                })}
              />
              {errors.borrower && <InputError message="Invalid address" />}
            </span>
          </li>
          <li>
            <span className="label">Asset</span>
            <span className="value">
              <select
                {...register("asset", {
                  value: supportedAssets[0]?.address,
                })}
              >
                {supportedAssets.map((asset) => {
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
              <input
                type="text"
                {...register("amount", {
                  required: true,
                  pattern: /^[0-9]*\.?[0-9]*$/,
                  min: 0,
                })}
              />
              {errors.amount && <InputError message="Invalid amount" />}
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

"use client";

import { InputError } from "./input_error";
import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { SupportedAssetResolverContext } from "@/services/supported_asset_resolver_provider";
import { EthereumAsset } from "@/models/asset";
import { calculateTokenAmount } from "@/lib/asset_amount";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { mainnet } from "viem/chains";
import { getEnsAddress } from "@wagmi/core";
import { useConfig } from "wagmi";
import { useModalWindow } from "react-modal-global";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";

export interface ProposeLoanModalProps {
  chainId: number | undefined;
  onClose: () => Promise<void>;
  onLoanProposal: () => Promise<void>;
}

export function ProposeLoanModal(props: ProposeLoanModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const errorReporter = useContext(ErrorReporterContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const wagmiConfig = useConfig();

  const supportedAssetResolver = useContext(SupportedAssetResolverContext);
  const chainId = props.chainId;

  const [supportedAssets, setSupportedAssets] = useState<EthereumAsset[]>([]);
  const [isImportedLoan, setImportedLoan] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    reValidateMode: "onChange",
  });

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
      .catch(errorReporter.reportAny);
  }, [chainId, supportedAssetResolver, errorReporter]);

  const proposeLoan = async (fieldValues: FieldValues): Promise<void> => {
    if (!loanService) {
      return;
    }

    if (supportedAssets.length === 0) {
      return;
    }

    const processingToken = await appStateService?.startProcessing(
      "propose_loan_modal:proposeLoan",
    );

    try {
      let chosenAssetAddress = fieldValues.asset;
      if (!chosenAssetAddress) {
        // The form won't fill in a value on load, so assume it's the first supported asset
        chosenAssetAddress = supportedAssets[0].address as string;
      }

      const chosenAsset = supportedAssets.find(
        (asset) => asset.address === chosenAssetAddress,
      );
      if (!chosenAsset) {
        errorReporter.reportErrorMessage(
          `Failed to find chosen asset for contract address: ${chosenAssetAddress}`,
        );

        return;
      }

      try {
        const tokenAmount = calculateTokenAmount(
          fieldValues.amount,
          chosenAsset.decimals,
        );

        let borrowerAddress = fieldValues.borrower;
        if (!borrowerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          const ensAddress = await getEnsAddress(wagmiConfig, {
            name: fieldValues.borrower,
            chainId: mainnet.id,
          });

          if (ensAddress) {
            borrowerAddress = ensAddress;
          } else {
            setError("borrower", {
              type: "custom",
              message: "Invalid address or ENS name",
            });

            return;
          }
        }

        if (isImportedLoan) {
          const paidAmount = calculateTokenAmount(
            fieldValues.amountPaid,
            chosenAsset.decimals,
          );

          await loanService.proposeLoanImport(
            fieldValues.borrower,
            tokenAmount,
            paidAmount,
            chosenAssetAddress,
          );
        } else {
          await loanService.proposeLoan(
            fieldValues.borrower,
            tokenAmount,
            chosenAssetAddress,
          );
        }

        await props.onLoanProposal();

        await props.onClose();
      } catch (error) {
        errorReporter.reportAny(error);
      }
    } finally {
      processingToken?.complete();
    }
  };

  return (
    <div className="popup-layout">
      <form onSubmit={handleSubmit(proposeLoan)}>
        <h3 className="section-title">Propose Loan</h3>
        <ul className="details">
          <li>
            <span className="label">Borrower</span>
            <span className="value">
              <input
                disabled={isProcessing}
                type="text"
                {...register("borrower", {
                  required: true,
                })}
              />
              {errors.borrower && <InputError message="Invalid address" />}
            </span>
          </li>
          <li>
            <span className="label">Asset</span>
            <span className="value">
              <select
                disabled={isProcessing}
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
                disabled={isProcessing}
                {...register("amount", {
                  required: true,
                  pattern: /^[0-9]*\.?[0-9]*$/,
                  min: 0,
                })}
              />
              {errors.amount && <InputError message="Invalid amount" />}
            </span>
          </li>
          <li>
            <input
              disabled={isProcessing}
              type="checkbox"
              {...register("isImported")}
              onClick={() => setImportedLoan(!isImportedLoan)}
            />
            <label htmlFor="isImported">
              This loan is being imported from a pre-existing agreement and does
              not require the transmission of any funds upon execution.
            </label>
          </li>
          <li>
            <span className="label">Amount Already Paid</span>
            <span className="value">
              <input
                type="text"
                disabled={isProcessing || !isImportedLoan}
                {...register("amountPaid", {
                  required: isImportedLoan,
                  pattern: /^[0-9]*\.?[0-9]*$/,
                  min: 0,
                })}
              />
              {errors.amountPaid && <InputError message="Invalid amount" />}
            </span>
          </li>
        </ul>
        <div className="form-buttons">
          <button type="submit" disabled={isProcessing}>
            Propose
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              modal.close();
              props.onClose();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

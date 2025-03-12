"use client";

import { InputError } from "../input_error";
import { useForm } from "react-hook-form";
import { FieldValues, useWatch } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { SupportedAssetResolverContext } from "@/services/supported_asset_resolver_provider";
import { EthereumAsset } from "@/models/asset";
import { calculateTokenAmount } from "@/lib/asset_amount";
import { mainnet } from "viem/chains";
import { getEnsAddress } from "@wagmi/core";
import { useConfig } from "wagmi";
import { useModalWindow } from "react-modal-global";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { AssetAmount } from "../asset_amount";
import { ModalWrapper } from "./modal_wrapper";

export interface ProposeLoanModalProps {
  chainId: number | undefined;
  onClose: () => Promise<void>;
  onLoanProposal: () => Promise<void>;
}

export function ProposeLoanModal(props: ProposeLoanModalProps) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const wagmiConfig = useConfig();

  const supportedAssetResolver = useContext(SupportedAssetResolverContext);
  const chainId = props.chainId;

  const [supportedAssets, setSupportedAssets] = useState<EthereumAsset[]>([]);
  const [isImportedLoan, setImportedLoan] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedError, setCapturedError] = useState<any>(undefined);
  const [currentTokenBalance, setCurrentTokenBalance] = useState<bigint>(0n);
  const [chosenAsset, setChosenAsset] = useState<EthereumAsset | undefined>(
    undefined,
  );

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
    control,
    reset,
  } = useForm({
    reValidateMode: "onChange",
  });

  modal.on("close", () => {
    reset();
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

        // Because this triggers based on the change of the chain,
        // clear out the previously-selected asset and replace it with the first supported asset
        const chosenAsset = sortedAssets[0];
        setChosenAsset(chosenAsset);
        if (chosenAsset) {
          loanService
            ?.getTokenBalance(chosenAsset.address as `0x${string}`)
            .then((balance) => {
              setCurrentTokenBalance(balance);
            })
            .catch((error) => {
              setCapturedError(error);
            });
        }
      })
      .catch((error) => {
        setCapturedError(error);
      });
  }, [chainId, loanService, supportedAssetResolver]);

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
        setCapturedError(
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
            name: borrowerAddress,
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
            borrowerAddress,
            tokenAmount,
            paidAmount,
            chosenAssetAddress,
          );
        } else {
          await loanService.proposeLoan(
            borrowerAddress,
            tokenAmount,
            chosenAssetAddress,
          );
        }

        await props.onLoanProposal();

        await props.onClose();

        modal.close();
      } catch (error) {
        setCapturedError(error);
      }
    } finally {
      processingToken?.complete();
    }
  };

  const assetWatch = useWatch({
    name: "asset",
    control: control,
    exact: true,
  });

  useEffect(() => {
    if (!assetWatch || !loanService || !supportedAssets.length) {
      setCurrentTokenBalance(0n);
      return;
    }

    if (supportedAssets.length === 0) {
      setCurrentTokenBalance(0n);
      return;
    }

    const supportedAsset = supportedAssets.find(
      (asset) => asset.address === assetWatch,
    );
    if (!supportedAsset) {
      setCurrentTokenBalance(0n);
      return;
    }

    setChosenAsset(supportedAsset);

    loanService
      .getTokenBalance(assetWatch)
      .then((balance) => {
        setCurrentTokenBalance(balance);
      })
      .catch((error) => {
        setCapturedError(error);
      });
  }, [assetWatch, loanService, supportedAssets]);

  return (
    <ModalWrapper reportedError={capturedError}>
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
            <span className="label">
              Amount {chosenAsset && "("}
              {chosenAsset && (
                <AssetAmount asset={chosenAsset} amount={currentTokenBalance} />
              )}
              {chosenAsset && " available )"}
              <div className="contextual-description">
                You can enter a value greater than what you currently have; you
                will only need enough to cover the loan at time of execution.
              </div>
            </span>
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
            <span className={"label" + (!isImportedLoan ? " disabled" : "")}>
              Amount Already Paid
            </span>
            <span className="value">
              <input
                type="text"
                placeholder="0.00"
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
          <button type="submit" disabled={isProcessing}>
            Propose
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

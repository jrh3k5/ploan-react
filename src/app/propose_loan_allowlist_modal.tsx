"use client";

import { InputError } from "./input_error";
import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { useContext, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { Identity } from "@/models/identity";
import { UserIdentity } from "./user_identity";
import { useConfig } from "wagmi";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";
import { getEnsAddress } from "@wagmi/core";
import { useModalWindow } from "react-modal-global";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { ErrorReporterProvider } from "@/services/error_reporter_provider";
import {
  InMemoryErrorReporter,
  registerErrorListener,
} from "@/services/error_reporter";
import { ErrorMessage } from "./error_message";

const errorReporter = new InMemoryErrorReporter();

export interface ProposeLoanAllowlistModalProps {
  allowList: Identity[];
  onAllowlistAddition: (identity: Identity) => Promise<void>;
  onAllowlistRemoval: (identity: Identity) => Promise<void>;
  onClose: () => Promise<void>;
}

export function ProposeLoanAllowlistModal(
  props: ProposeLoanAllowlistModalProps,
) {
  const loanService = useContext(PersonalLoanContext);
  const appStateService = useContext(ApplicationStateServiceContext);
  const wagmiConfig = useConfig();
  const modal = useModalWindow();

  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  registerErrorListener(errorReporter, setCapturedError);

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
    setValue,
    setError,
  } = useForm({
    reValidateMode: "onChange",
  });

  const removeAllowedUser = async (identity: Identity) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "propose_loan_allowlist_modal:removeAllowedUser",
    );

    try {
      await loanService.disallowLoanProposal(identity);

      await props.onAllowlistRemoval(identity);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  const addToAllowlist = async (fieldValues: FieldValues) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "propose_loan_allowlist_modal:addToAllowlist",
    );

    try {
      let address = fieldValues.allowlistedAddress;
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        const ensAddress = await getEnsAddress(wagmiConfig, {
          name: fieldValues.allowlistedAddress,
          chainId: mainnet.id,
        });

        if (ensAddress) {
          address = normalize(ensAddress);
        } else {
          setError("allowlistedAddress", {
            type: "custom",
            message: "Invalid address or ENS name",
          });

          return;
        }
      }

      const newIdentity = new Identity(address);

      await loanService.allowLoanProposal(newIdentity);

      setValue("allowlistedAddress", "");

      await props.onAllowlistAddition(newIdentity);
    } catch (error) {
      errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <div className="popup-layout">
      <ErrorReporterProvider errorReporter={errorReporter}>
        {capturedError && <ErrorMessage error={capturedError} />}
        <form onSubmit={handleSubmit(addToAllowlist)}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.allowList.map((identity) => (
                <tr key={identity.address}>
                  <td className="address-container">
                    <UserIdentity identity={identity} />
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => removeAllowedUser(identity)}
                      disabled={isProcessing}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    disabled={isProcessing}
                    {...register("allowlistedAddress", {
                      required: true,
                    })}
                    type="text"
                    placeholder="Enter user address"
                  ></input>
                  {errors.allowlistedAddress && (
                    <InputError message="Invalid allowlist address provided" />
                  )}
                </td>
                <td className="actions">
                  <button type="submit" disabled={isProcessing}>
                    Add to Allowlist
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <div className="form-buttons">
          <button
            disabled={isProcessing}
            onClick={async () => {
              modal.close();
              await props.onClose();
            }}
          >
            Close
          </button>
        </div>
      </ErrorReporterProvider>
    </div>
  );
}

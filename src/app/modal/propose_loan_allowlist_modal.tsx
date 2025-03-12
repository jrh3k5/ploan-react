"use client";

import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { useCallback, useContext, useEffect, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { Identity } from "@/models/identity";
import { UserIdentity } from "../user_identity";
import { useConfig } from "wagmi";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";
import { getEnsAddress } from "@wagmi/core";
import { useModalWindow } from "react-modal-global";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { Modal } from "@/lib/modal";
import { ProposeLoanAllowlistRemovalConfirmation } from "./propose_loan_allowlist_removal_confirmation_modal";
import { ProposeLoanAllowlistAdditionConfirmation } from "./propose_loan_allowlist_addition_confirmation_modal";
import { ModalWrapper } from "./modal_wrapper";

export interface ProposeLoanAllowlistModalProps {
  chainId: number | undefined;
  userAddress: string | undefined;
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
  const [capturedError, setCapturedError] = useState<any>(undefined);
  const [allowlist, setAllowlist] = useState<Identity[]>([]);

  const loadAllowlist = useCallback(async () => {
    if (!loanService) {
      return;
    }

    try {
      const allowlist = await loanService.getLoanProposalAllowlist();
      setAllowlist(allowlist);
    } catch (error) {
      setCapturedError(error);
    }
  }, [loanService]);

  // Do an initial load of the allowlist into the UI.
  // Use useEffect so that this only fires when the component
  // mounts and not every time it renders.
  useEffect(() => {
    loadAllowlist();
    // The linter is disabled because if the dependency array is removed,
    // this is fired every time the component renders. The linter flags the
    // empty dependency array every time, however.
    // eslint-disable-next-line
  }, []);

  // Break refreshing away from initial load because that attempts
  // to update components' state at the same time, which React does not like
  const refreshAllowlist = useCallback(async () => {
    const token = await appStateService?.startProcessing(
      "propose_loan_allowlist_modal:refreshAllowlist",
    );
    try {
      await loadAllowlist();
    } finally {
      await token?.complete();
    }
  }, [appStateService, loadAllowlist]);

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

  const { register, handleSubmit, setValue, setError, reset } = useForm({
    reValidateMode: "onChange",
  });

  modal.on("close", () => {
    reset();
  });

  useEffect(() => {
    // Reload the allowlist *any* time the chain or address is changed
    refreshAllowlist().catch((error) => {
      setCapturedError(error);
    });
  }, [loanService, refreshAllowlist, props.chainId, props.userAddress]);

  const removeAllowedUser = async (identity: Identity) => {
    if (!loanService) {
      return;
    }

    Modal.open(ProposeLoanAllowlistRemovalConfirmation, {
      toRemove: identity,
      onRemoval: async () => {
        await refreshAllowlist();
      },
    });
  };

  const addToAllowlist = async (fieldValues: FieldValues) => {
    if (!loanService) {
      return;
    }

    // TODO: add modal dialog for adding a user

    const token = await appStateService?.startProcessing(
      "propose_loan_allowlist_modal:addToAllowlist",
    );

    let toAdd: Identity;
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

      toAdd = new Identity(address);
    } catch (error) {
      setCapturedError(error);

      return;
    } finally {
      await token?.complete();
    }

    Modal.open(ProposeLoanAllowlistAdditionConfirmation, {
      toAdd: toAdd,
      onAddition: async () => {
        setValue("allowlistedAddress", "");

        await refreshAllowlist();
      },
    });
  };

  return (
    <ModalWrapper reportedError={capturedError}>
      <ul className="details">
        <li className="details">
          <form onSubmit={handleSubmit(addToAllowlist)}>
            <div>
              <span className="label">Add to Allowlist</span>
              <span className="value">
                <input {...register("allowlistedAddress")} />
              </span>
            </div>
            <div className="form-buttons">
              <button type="submit" disabled={isProcessing}>
                Add to Allowlist
              </button>
            </div>
          </form>
        </li>
        <li>
          <span className="label">Manage Allowlist</span>
          <span className="value">
            <div>
              <table>
                <tbody>
                  {allowlist.map((identity) => (
                    <tr key={identity.address}>
                      <td className="address-container">
                        <UserIdentity identity={identity} />
                      </td>
                      <td className="actions single-item">
                        <button
                          onClick={() => removeAllowedUser(identity)}
                          disabled={isProcessing}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </span>
        </li>
      </ul>
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
    </ModalWrapper>
  );
}

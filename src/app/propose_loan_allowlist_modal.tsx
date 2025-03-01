"use client";

import { InputError } from "./input_error";
import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { Identity } from "@/models/identity";
import { UserIdentity } from "./user_identity";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { useConfig } from "wagmi";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";
import { getEnsAddress } from "@wagmi/core";

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
  const errorReporter = useContext(ErrorReporterContext);
  const wagmiConfig = useConfig();

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

    try {
      await loanService.disallowLoanProposal(identity);

      await props.onAllowlistRemoval(identity);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  };

  const addToAllowlist = async (fieldValues: FieldValues) => {
    if (!loanService) {
      return;
    }

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
    }
  };

  return (
    <>
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
                <td>
                  <UserIdentity identity={identity} />
                </td>
                <td className="actions">
                  <button onClick={() => removeAllowedUser(identity)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <input
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
                <button type="submit">Add to Allowlist</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div className="form-buttons">
        <button onClick={props.onClose}>Close</button>
      </div>
    </>
  );
}

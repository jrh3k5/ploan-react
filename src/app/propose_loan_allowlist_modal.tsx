"use client";

import { InputError } from "./input_error";
import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form";
import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { Identity } from "@/models/identity";
import { UserIdentity } from "./user_identity";

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

  const removeAllowedUser = async (identity: Identity) => {
    if (!loanService) {
      return;
    }

    await loanService.disallowLoanProposal(identity);

    await props.onAllowlistRemoval(identity);
  };

  const addToAllowlist = async (fieldValues: FieldValues) => {
    if (!loanService) {
      return;
    }

    const address = fieldValues.allowlistedAddress;
    const newIdentity = new Identity(address);

    await loanService.allowLoanProposal(newIdentity);

    await props.onAllowlistAddition(newIdentity);
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
                    pattern: /^0x[a-fA-F0-9]{40}$/,
                  })}
                  type="text"
                  placeholder="Enter user address"
                ></input>
                {errors.allowlistedAddress && (
                  <InputError message="An address must be provided" />
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
    </div>
  );
}

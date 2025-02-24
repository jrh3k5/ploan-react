"use client";

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

  const addToAllowlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loanService) {
      return;
    }

    const address = e.currentTarget.allowlistedAddress.value;
    const newIdentity = new Identity(address);

    await loanService.allowLoanProposal(newIdentity);

    await props.onAllowlistAddition(newIdentity);
  };

  return (
    <div className="modal">
      <form onSubmit={(e) => addToAllowlist(e)}>
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
                  name="allowlistedAddress"
                  type="text"
                  placeholder="Enter user address"
                ></input>
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

"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { Identity } from "@/models/identity";
import { UserIdentity } from "./user_identity";

export interface ProposeLoanAllowlistModalProps {
  chainId: number;
  userAddress: string | undefined;
  onClose: () => Promise<void>;
}

export function ProposeLoanAllowlistModal(
  props: ProposeLoanAllowlistModalProps,
) {
  const loanService = useContext(PersonalLoanContext);
  const chainId = props.chainId;
  const userAddress = props.userAddress;

  const [allowlist, setAllowlist] = useState<Identity[]>([]);

  const reloadAllowlist = useCallback(async () => {
    if (!loanService) {
      return;
    }

    const allowlist = await loanService.getLoanProposalAllowlist();
    setAllowlist(allowlist);
  }, [loanService]);

  useEffect(() => {
    if (!loanService) {
      return;
    }

    loanService;
    reloadAllowlist().catch((error) => {
      console.error("Failed to retrieve loan proposal allowlist", error);
    });
  }, [loanService, reloadAllowlist, chainId, userAddress]);

  const removeAllowedUser = async (identity: Identity) => {
    if (!loanService) {
      return;
    }

    await loanService.disallowLoanProposal(identity);

    await reloadAllowlist();
  };

  const addToAllowlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loanService) {
      return;
    }

    const address = e.currentTarget.allowlistedAddress.value;
    await loanService.allowLoanProposal(new Identity(address));

    await reloadAllowlist();
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
            {allowlist.map((identity) => (
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

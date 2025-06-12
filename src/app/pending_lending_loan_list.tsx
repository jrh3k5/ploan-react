"use client";

import { useContext } from "react";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";
import { UserIdentity } from "./user_identity";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { AssetAmount } from "./asset_amount";
import { ProposeLoanModal } from "./modal/propose_loan_modal";
import { PendingLoanStatus } from "./pending_loan_status";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { Modal } from "@/lib/modal";
import { TokenApproval } from "./modal/token_approval_modal";
import { AssetAmountPrepaid } from "./asset_amount_prepaid";
import { ProcessingAwareProps } from "./processing_aware_props";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";
import { SubmitPaymentModal } from "./modal/submit_payment_modal";

export interface PendingLendingLoanListProps extends ProcessingAwareProps {
  pendingLoans: PendingLoan[];
  chainId: number | undefined;
  onLoanCancellation: (loanID: string) => Promise<void>;
  onLoanExecution: (loanID: string) => Promise<void>;
  onLoanProposal: () => Promise<void>;
  loanService?: PersonalLoanService | null;
  errorReporter?: { reportAny: (error: any) => Promise<void> | void } | null;
  appStateService?: {
    startProcessing: (
      name: string,
    ) => Promise<{ complete: () => Promise<void> | void }>;
  } | null;
}

// PendingLendingLoanList provides a component to show what offers of loans a user has to other users that have not yet been executed
export function PendingLendingLoanList(props: PendingLendingLoanListProps) {
  const loanService = props.loanService || useContext(PersonalLoanContext);
  const errorReporter = props.errorReporter || useContext(ErrorReporterContext);
  const appStateService =
    props.appStateService || useContext(ApplicationStateServiceContext);

  const pendingLoans = props.pendingLoans;

  const cancelLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "pending_lending_loan_list:cancelLoan",
    );
    try {
      await loanService.cancelPendingLoan(loanID);

      await props.onLoanCancellation(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  const showTokenApproval = async (pendingLoan: PendingLoan) => {
    try {
      Modal.open(TokenApproval, {
        onCancel: async () => {},
        onApprove: async () => showPaymentSubmission(pendingLoan),
        amount: `${pendingLoan.amountLoaned}`,
        asset: pendingLoan.asset,
        recipient: pendingLoan.borrower,
      });
    } catch (error) {
      errorReporter.reportAny(error);
    }
  };

  const showPaymentSubmission = async (pendingLoan: PendingLoan) => {
    try {
      Modal.open(SubmitPaymentModal, {
        asset: pendingLoan.asset,
        amount: `${pendingLoan.amountLoaned}`,
        recipient: pendingLoan.borrower,
        submitPayment: async (amount: bigint) => {
          await executeLoan(loanService, pendingLoan.loanID);
        },
        onPaymentSubmission: async (_: bigint) => {
          await props.onLoanExecution(pendingLoan.loanID);
        },
      });
    } catch (error) {
      errorReporter.reportAny(error);
    }
  };

  const executeLoan = async (
    loanService: PersonalLoanService | null,
    loanID: string,
  ) => {
    if (!loanService) {
      return;
    }

    const token = await appStateService?.startProcessing(
      "pending_lending_loan_list:executeLoan",
    );
    try {
      await loanService.executeLoan(loanID);

      await props.onLoanExecution(loanID);
    } catch (error) {
      await errorReporter.reportAny(error);
    } finally {
      await token?.complete();
    }
  };

  return (
    <div className="loan-grouping">
      <h3>Loans You&apos;ve Offered Others ({pendingLoans.length})</h3>
      <div>
        <button
          onClick={() => {
            Modal.open(ProposeLoanModal, {
              chainId: props.chainId,
              onLoanProposal: async () => props.onLoanProposal(),
              onClose: async () => {},
            });
          }}
          disabled={props.isProcessing}
        >
          Propose Loan
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Borrower</th>
            <th>Amount to Lend</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingLoans.map((pendingLoan) => (
            <tr key={pendingLoan.loanID}>
              <td>
                <UserIdentity identity={pendingLoan.borrower} />
              </td>
              <td className="amount">
                <AssetAmount
                  asset={pendingLoan.asset}
                  amount={pendingLoan.amountLoaned}
                />
                {pendingLoan.imported && (
                  <AssetAmountPrepaid
                    asset={pendingLoan.asset}
                    amount={pendingLoan.amountPaid}
                  />
                )}
              </td>
              <td className="status">
                <PendingLoanStatus loan={pendingLoan} />
              </td>
              <td className="actions">
                {pendingLoan.status == PendingLoanStatusEnum.ACCEPTED && (
                  <button
                    disabled={props.isProcessing}
                    onClick={async () => {
                      if (!loanService) {
                        throw new Error(
                          "Loan service must be set in order to execute a loan",
                        );
                      }

                      if (pendingLoan.imported) {
                        await executeLoan(loanService, pendingLoan.loanID);

                        return;
                      }

                      const allowance =
                        await loanService.getApplicationAllowance(
                          pendingLoan.asset.address!,
                        );
                      if (allowance < pendingLoan.amountLoaned) {
                        await showTokenApproval(pendingLoan);
                      } else {
                        await showPaymentSubmission(pendingLoan);
                      }
                    }}
                  >
                    Execute Loan
                  </button>
                )}
                <button
                  disabled={props.isProcessing}
                  onClick={() => cancelLoan(loanService, pendingLoan.loanID)}
                >
                  Cancel Pending Lend
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

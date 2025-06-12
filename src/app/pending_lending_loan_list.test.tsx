import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PendingLendingLoanList } from "./pending_lending_loan_list";
import {
  PendingLoanStatus as PendingLoanStatusEnum,
  PendingLoan,
} from "@/models/pending_loan";

import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { ApplicationStateServiceContext } from "@/services/application_state_service_provider";

// Mocks for subcomponents
jest.mock("./user_identity", () => ({
  UserIdentity: ({ identity }: any) => (
    <span data-testid="user-identity">{identity.address}</span>
  ),
}));
jest.mock("./asset_amount", () => ({
  AssetAmount: ({ asset, amount }: any) => (
    <span data-testid="asset-amount">
      {amount} {asset.symbol}
    </span>
  ),
}));
jest.mock("./asset_amount_prepaid", () => ({
  AssetAmountPrepaid: ({ amount }: any) => (
    <span data-testid="asset-amount-prepaid">{amount}</span>
  ),
}));
jest.mock("./pending_loan_status", () => ({
  PendingLoanStatus: ({ loan }: any) => (
    <span data-testid="pending-loan-status">{loan.status}</span>
  ),
}));

jest.mock("./modal/propose_loan_modal", () => ({
  ProposeLoanModal: () => (
    <div data-testid="propose-loan-modal">ProposeLoanModal</div>
  ),
}));
jest.mock("./modal/token_approval_modal", () => ({
  TokenApproval: () => <div data-testid="token-approval">TokenApproval</div>,
}));
jest.mock("./modal/submit_payment_modal", () => ({
  SubmitPaymentModal: () => (
    <div data-testid="submit-payment-modal">SubmitPaymentModal</div>
  ),
}));
jest.mock("@/lib/modal", () => ({ Modal: { open: jest.fn() } }));

const mockIdentity = { address: "0xabc" };
const mockAsset = { symbol: "ETH", address: "0xasset" };

function makeLoan(overrides: Partial<PendingLoan> = {}): PendingLoan {
  return {
    loanID: "loan1",
    lender: mockIdentity,
    borrower: mockIdentity,
    amountLoaned: 100n,
    amountPaid: 0n,
    asset: mockAsset,
    status: PendingLoanStatusEnum.ACCEPTED,
    imported: false,
    ...overrides,
  } as PendingLoan;
}

describe("PendingLendingLoanList", () => {
  it("renders loan rows and headers", () => {
    render(
      <PendingLendingLoanList
        pendingLoans={[makeLoan()]}
        chainId={1}
        onLoanCancellation={jest.fn()}
        onLoanExecution={jest.fn()}
        onLoanProposal={jest.fn()}
        isProcessing={false}
      />,
    );
    expect(
      screen.getByText("Loans You've Offered Others (1)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Borrower")).toBeInTheDocument();
    expect(screen.getByTestId("user-identity")).toHaveTextContent("0xabc");
    expect(screen.getByTestId("asset-amount")).toHaveTextContent("100 ETH");
    expect(screen.getByTestId("pending-loan-status")).toHaveTextContent(
      String(PendingLoanStatusEnum.ACCEPTED),
    );
    expect(screen.getByText("Cancel Pending Lend")).toBeInTheDocument();
    expect(screen.getByText("Execute Loan")).toBeInTheDocument();
  });

  it("calls onLoanCancellation when cancel is clicked", async () => {
    const onLoanCancellation = jest.fn().mockResolvedValue(undefined);
    const loanService = {
      acceptBorrow: jest.fn(),
      allowLoanProposal: jest.fn(),
      approveTokenTransfer: jest.fn(),
      cancelLendingLoan: jest.fn(),
      cancelPendingLoan: jest.fn().mockResolvedValue(undefined),
      deleteLoan: jest.fn(),
      disallowLoanProposal: jest.fn(),
      executeLoan: jest.fn(),
      getApplicationAllowance: jest.fn(),
      getBorrowingLoans: jest.fn(),
      getLendingLoans: jest.fn(),
      getLoanProposalAllowlist: jest.fn(),
      getPendingBorrowingLoans: jest.fn(),
      getPendingLendingLoans: jest.fn(),
      getTokenBalance: jest.fn(),
      proposeLoan: jest.fn(),
      proposeLoanImport: jest.fn(),
      rejectBorrow: jest.fn(),
      repayLoan: jest.fn(),
    };
    const errorReporter = { reportAny: jest.fn() };
    const appStateService = {
      startProcessing: jest.fn().mockResolvedValue({ complete: jest.fn() }),
    };

    render(
      <PendingLendingLoanList
        pendingLoans={[makeLoan()]}
        chainId={1}
        onLoanCancellation={onLoanCancellation}
        onLoanExecution={jest.fn()}
        onLoanProposal={jest.fn()}
        isProcessing={false}
        loanService={loanService}
        errorReporter={errorReporter}
        appStateService={appStateService}
      />,
    );
    fireEvent.click(screen.getByText("Cancel Pending Lend"));
    // Flush all pending promises/microtasks
    await waitFor(() =>
      expect(loanService.cancelPendingLoan).toHaveBeenCalledWith("loan1"),
    );
    await waitFor(() =>
      expect(onLoanCancellation).toHaveBeenCalledWith("loan1"),
    );
  });

  it("disables buttons when isProcessing is true", () => {
    render(
      <PendingLendingLoanList
        pendingLoans={[makeLoan()]}
        chainId={1}
        onLoanCancellation={jest.fn()}
        onLoanExecution={jest.fn()}
        onLoanProposal={jest.fn()}
        isProcessing={true}
      />,
    );
    expect(screen.getByText("Propose Loan")).toBeDisabled();
    expect(screen.getByText("Cancel Pending Lend")).toBeDisabled();
    expect(screen.getByText("Execute Loan")).toBeDisabled();
  });

  it("shows AssetAmountPrepaid if imported is true", () => {
    render(
      <PendingLendingLoanList
        pendingLoans={[makeLoan({ imported: true, amountPaid: 50n })]}
        chainId={1}
        onLoanCancellation={jest.fn()}
        onLoanExecution={jest.fn()}
        onLoanProposal={jest.fn()}
        isProcessing={false}
      />,
    );
    expect(screen.getByTestId("asset-amount-prepaid")).toHaveTextContent("50");
  });
});

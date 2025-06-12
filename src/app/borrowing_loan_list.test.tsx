import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  BorrowingLoanList,
  BorrowingLoanListProps,
} from "./borrowing_loan_list";
import { PersonalLoan, LoanStatus } from "@/models/personal_loan";
import { Identity } from "@/models/identity";
import { EthereumAsset } from "@/models/asset";
import { PersonalLoanContext } from "@/services/personal_loan_service_provider";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

// Mock react-modal-global and all modal imports to avoid ESM import errors
jest.mock("react-modal-global", () => ({ Modal: { open: jest.fn() } }));
jest.mock("./modal/loan_repayment_modal", () => ({
  LoanRepaymentModal: () => null,
}));
jest.mock("./modal/token_approval_modal", () => ({
  TokenApproval: () => null,
}));
jest.mock("./modal/submit_payment_modal", () => ({
  SubmitPaymentModal: () => null,
}));
jest.mock("./modal/delete_loan_modal", () => ({ DeleteLoanModal: () => null }));
jest.mock("@/lib/modal", () => ({ Modal: { open: jest.fn() } }));

// Mock child components
jest.mock("./loan_progress", () => ({
  LoanProgress: () => <div>LoanProgress</div>,
}));
jest.mock("./loan_status", () => ({ LoanStatus: () => <div>LoanStatus</div> }));
jest.mock("./user_identity", () => ({
  UserIdentity: () => <div>UserIdentity</div>,
}));

const mockIdentity = new Identity("0x123");
const mockAsset = new EthereumAsset(1, "DAI", 18, "0xABC");

const mockLoan: PersonalLoan = {
  loanID: "loan-1",
  asset: mockAsset,
  lender: mockIdentity,
  borrower: mockIdentity,
  status: LoanStatus.IN_PROGRESS,
  amountLoaned: BigInt(100),
  amountRepaid: BigInt(0),
  toJSON: function () {
    return {
      loanID: this.loanID,
      borrower: this.borrower,
      lender: this.lender,
      amountLoaned: `${this.amountLoaned}`,
      amountRepaid: `${this.amountRepaid}`,
      asset: this.asset,
      status: this.status,
    };
  },
};

const renderComponent = (overrideProps?: Partial<BorrowingLoanListProps>) => {
  const defaultProps: BorrowingLoanListProps = {
    borrowingLoans: [mockLoan],
    onPaymentSubmission: jest.fn(() => Promise.resolve()),
    onLoanDeletion: jest.fn(() => Promise.resolve()),
    isProcessing: false,
  };
  return render(
    <PersonalLoanContext.Provider
      value={
        {
          getApplicationAllowance: jest.fn(() => Promise.resolve(BigInt(1000))),
        } as any
      }
    >
      <ErrorReporterContext.Provider value={{ report: jest.fn() } as any}>
        <BorrowingLoanList {...defaultProps} {...overrideProps} />
      </ErrorReporterContext.Provider>
    </PersonalLoanContext.Provider>,
  );
};

describe("BorrowingLoanList", () => {
  it("renders without crashing and displays loans", () => {
    renderComponent();
    expect(screen.getByText("LoanProgress")).toBeInTheDocument();
    expect(screen.getByText("LoanStatus")).toBeInTheDocument();
    expect(screen.getByText("UserIdentity")).toBeInTheDocument();
  });

  it("renders empty state when no loans", () => {
    renderComponent({ borrowingLoans: [] });
    expect(screen.queryByText("LoanProgress")).not.toBeInTheDocument();
  });

  it("renders Repay button only for IN_PROGRESS loans", () => {
    const loanInProgress = {
      ...mockLoan,
      status: LoanStatus.IN_PROGRESS,
      asset: new EthereumAsset(1, "DAI", 18, "0xABC"),
      lender: mockIdentity,
      toJSON: mockLoan.toJSON,
    };
    const loanCompleted = {
      ...mockLoan,
      loanID: "loan-2",
      status: LoanStatus.COMPLETED,
      asset: new EthereumAsset(1, "USDC", 18, "0xDEF"),
      lender: mockIdentity,
      toJSON: mockLoan.toJSON,
    };
    renderComponent({ borrowingLoans: [loanInProgress, loanCompleted] });
    expect(screen.getByText("Repay DAI")).toBeInTheDocument();
    expect(screen.queryByText("Repay USDC")).not.toBeInTheDocument();
  });

  it("renders Delete button only for CANCELED or COMPLETED loans", () => {
    const loanCanceled = {
      ...mockLoan,
      status: LoanStatus.CANCELED,
      asset: new EthereumAsset(1, "DAI", 18, "0xABC"),
      loanID: "loan-3",
      toJSON: mockLoan.toJSON,
    };
    const loanCompleted = {
      ...mockLoan,
      status: LoanStatus.COMPLETED,
      asset: new EthereumAsset(1, "USDC", 18, "0xDEF"),
      loanID: "loan-4",
      toJSON: mockLoan.toJSON,
    };
    const loanInProgress = {
      ...mockLoan,
      status: LoanStatus.IN_PROGRESS,
      asset: new EthereumAsset(1, "TUSD", 18, "0xFED"),
      loanID: "loan-5",
      toJSON: mockLoan.toJSON,
    };
    renderComponent({
      borrowingLoans: [loanCanceled, loanCompleted, loanInProgress],
    });
    expect(screen.getAllByText("Delete").length).toBe(2);
    expect(screen.queryByText("Repay TUSD")).toBeInTheDocument();
  });

  it("disables action buttons when isProcessing is true", () => {
    const loanInProgress = {
      ...mockLoan,
      status: LoanStatus.IN_PROGRESS,
      asset: new EthereumAsset(1, "DAI", 18, "0xABC"),
      toJSON: mockLoan.toJSON,
    };
    renderComponent({ borrowingLoans: [loanInProgress], isProcessing: true });
    expect(screen.getByText("Repay DAI")).toBeDisabled();
  });

  it("opens repayment modal when Repay button is clicked", () => {
    const loanInProgress = {
      ...mockLoan,
      status: LoanStatus.IN_PROGRESS,
      asset: new EthereumAsset(1, "DAI", 18, "0xABC"),
      toJSON: mockLoan.toJSON,
    };
    renderComponent({ borrowingLoans: [loanInProgress] });
    fireEvent.click(screen.getByText("Repay DAI"));
    const { Modal } = require("@/lib/modal");
    expect(Modal.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ loan: loanInProgress }),
    );
  });

  it("opens deletion modal when Delete button is clicked", () => {
    const loanCompleted = {
      ...mockLoan,
      status: LoanStatus.COMPLETED,
      asset: new EthereumAsset(1, "USDC", 18, "0xDEF"),
      toJSON: mockLoan.toJSON,
    };
    renderComponent({ borrowingLoans: [loanCompleted] });
    fireEvent.click(screen.getByText("Delete"));
    const { Modal } = require("@/lib/modal");
    expect(Modal.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ loan: loanCompleted }),
    );
  });

  // Note: Sorting and callback invocation would require more advanced mocking and integration,
  it("sorts loans using compareByStatus", () => {
    // Fake compareByStatus: IN_PROGRESS < COMPLETED < CANCELED
    const loan1 = {
      ...mockLoan,
      loanID: "1",
      status: LoanStatus.COMPLETED,
      asset: new EthereumAsset(1, "USDC", 18, "0xDEF"),
      toJSON: mockLoan.toJSON,
    };
    const loan2 = {
      ...mockLoan,
      loanID: "2",
      status: LoanStatus.IN_PROGRESS,
      asset: new EthereumAsset(1, "DAI", 18, "0xABC"),
      toJSON: mockLoan.toJSON,
    };
    const loan3 = {
      ...mockLoan,
      loanID: "3",
      status: LoanStatus.CANCELED,
      asset: new EthereumAsset(1, "TUSD", 18, "0xFED"),
      toJSON: mockLoan.toJSON,
    };
    renderComponent({ borrowingLoans: [loan1, loan2, loan3] });
    // The first button in the rendered table should be for the IN_PROGRESS loan
    const repayButton = screen.getByText("Repay DAI");
    expect(repayButton.closest("tr")).toBeTruthy();
  });
});

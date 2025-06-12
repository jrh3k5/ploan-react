import React from "react";
import { render, screen } from "@testing-library/react";
import { PendingLoanStatus } from "./pending_loan_status";
import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";

// Minimal mock for Identity and EthereumAsset
const mockIdentity = { address: "0x123" } as any;
const mockAsset = { symbol: "ETH" } as any;

function makeLoan(status: PendingLoanStatusEnum) {
  return new PendingLoan(
    "loan1",
    mockIdentity,
    mockIdentity,
    100n,
    0n,
    mockAsset,
    status,
    false,
  );
}

describe("PendingLoanStatus", () => {
  it("shows 'Waiting on Borrower' for WAITING_FOR_ACCEPTANCE", () => {
    render(
      <PendingLoanStatus
        loan={makeLoan(PendingLoanStatusEnum.WAITING_FOR_ACCEPTANCE)}
      />,
    );
    expect(screen.getByText("Waiting on Borrower")).toBeInTheDocument();
  });

  it("shows 'Waiting on Lender' for ACCEPTED", () => {
    render(
      <PendingLoanStatus loan={makeLoan(PendingLoanStatusEnum.ACCEPTED)} />,
    );
    expect(screen.getByText("Waiting on Lender")).toBeInTheDocument();
  });

  it("shows 'Executed' for EXECUTED", () => {
    render(
      <PendingLoanStatus loan={makeLoan(PendingLoanStatusEnum.EXECUTED)} />,
    );
    expect(screen.getByText("Executed")).toBeInTheDocument();
  });

  it("shows 'Unspecified' for UNSPECIFIED", () => {
    render(
      <PendingLoanStatus loan={makeLoan(PendingLoanStatusEnum.UNSPECIFIED)} />,
    );
    expect(screen.getByText("Unspecified")).toBeInTheDocument();
  });

  it("shows 'Unknown: <status>' for unknown status enum", () => {
    // @ts-expect-error - using a bogus status to test fallback
    render(<PendingLoanStatus loan={makeLoan(999)} />);
    expect(screen.getByText("Unknown: 999")).toBeInTheDocument();
  });
});

"use client";

import {
  PendingLoan,
  PendingLoanStatus as PendingLoanStatusEnum,
} from "@/models/pending_loan";

export interface PendingLoanStatusProps {
  loan: PendingLoan;
}

// PendingLoanStatus is a component that provides human-readable descriptors of pendig loan states
export function PendingLoanStatus(props: PendingLoanStatusProps) {
  let statusText: string;
  switch (props.loan.status) {
    case PendingLoanStatusEnum.WAITING_FOR_ACCEPTANCE:
      statusText = "Waiting on Borrower";
      break;
    case PendingLoanStatusEnum.ACCEPTED:
      statusText = "Waiting on Lender";
      break;
    case PendingLoanStatusEnum.EXECUTED:
      statusText = "Executed";
      break;
    case PendingLoanStatusEnum.UNSPECIFIED:
      statusText = "Unspecified";
      break;
    default:
      statusText = `Unknown: ${props.loan.status}`;
  }

  return <span>{statusText}</span>;
}

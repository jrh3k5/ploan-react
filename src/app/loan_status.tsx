"use client";

import { PersonalLoan } from "@/models/personal_loan";
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";
import { ProcessingAwareProps } from "./processing_aware_props";

// LoanStatusProps describes the properties needed by the LoanStatus component.
export interface LoanStatusProps {
  loan: PersonalLoan;
}

// LoanStatus is a component that provides human-readable descriptors of loan states
export function LoanStatus(props: LoanStatusProps) {
  let statusText: string;
  switch (props.loan.status) {
    case LoanStatusEnum.IN_PROGRESS:
      statusText = "In Progress";
      break;
    case LoanStatusEnum.COMPLETED:
      statusText = "Completed";
      break;
    case LoanStatusEnum.CANCELED:
      statusText = "Canceled";
      break;
    case LoanStatusEnum.UNSPECIFIED:
      statusText = "Unspecified";
      break;
    default:
      statusText = `Unknown: ${props.loan.status}`;
  }
  return <span>{statusText}</span>;
}

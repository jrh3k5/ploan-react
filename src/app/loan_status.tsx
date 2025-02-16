'use client'

import { PersonalLoan } from "@/models/personal_loan"
import { LoanStatus as LoanStatusEnum } from "@/models/personal_loan";

export function LoanStatus(props: { loan: PersonalLoan }) {
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
    return (
        <span>{statusText}</span>
    )
}
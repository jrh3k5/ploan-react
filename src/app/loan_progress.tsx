import { PersonalLoan } from "@/models/personal_loan"
import { Asset } from "./asset"

export function LoanProgress(props: { loan: PersonalLoan }) {
    return (
        <span>{props.loan.amountRepaid.toString()} / {props.loan.amountLoaned.toString()} <Asset asset={props.loan.asset} /></span>
    )
}
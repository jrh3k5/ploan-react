import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";

export class PendingLoan {
    loanID: string
    lender: Identity
    borrower: Identity
    amountLoaned: bigint
    asset: EthereumAsset

    constructor(
        loanID: string,
        lender: Identity,
        borrower: Identity,
        amountLoaned: bigint,
        asset: EthereumAsset
    ) { 
        this.loanID = loanID;
        this.lender = lender;
        this.borrower = borrower;
        this.amountLoaned = amountLoaned;
        this.asset = asset;
    }
}
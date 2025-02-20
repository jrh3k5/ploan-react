import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";

export class PendingLoan {
  loanID: string;
  lender: Identity;
  borrower: Identity;
  amountLoaned: bigint;
  asset: EthereumAsset;
  status: PendingLoanStatus;

  constructor(
    loanID: string,
    lender: Identity,
    borrower: Identity,
    amountLoaned: bigint,
    asset: EthereumAsset,
    status: PendingLoanStatus,
  ) {
    this.loanID = loanID;
    this.lender = lender;
    this.borrower = borrower;
    this.amountLoaned = amountLoaned;
    this.asset = asset;
    this.status = status;
  }
}

export enum PendingLoanStatus {
  UNSPECIFIED,
  WAITING_FOR_ACCEPTANCE, // the loan proposal has not yet been accepted by the borrower
  ACCEPTED, // the loan proposal has been accepted by the borrower, but not yet executed
  EXECUTED, // the loan has been executed, transferring the assets from the lender to the borrower
}

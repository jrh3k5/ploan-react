import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";

export class PendingLoan {
  loanID: string;
  lender: Identity;
  borrower: Identity;
  amountLoaned: bigint;
  amountPaid: bigint;
  asset: EthereumAsset;
  status: PendingLoanStatus;
  imported: boolean;

  constructor(
    loanID: string,
    lender: Identity,
    borrower: Identity,
    amountLoaned: bigint,
    amountPaid: bigint, // for imported loans, specify how much of the loan has been paid so far
    asset: EthereumAsset,
    status: PendingLoanStatus,
    imported: boolean,
  ) {
    this.loanID = loanID;
    this.lender = lender;
    this.borrower = borrower;
    this.amountLoaned = amountLoaned;
    this.amountPaid = amountPaid;
    this.asset = asset;
    this.status = status;
    this.imported = imported;
  }
}

export enum PendingLoanStatus {
  UNSPECIFIED,
  WAITING_FOR_ACCEPTANCE, // the loan proposal has not yet been accepted by the borrower
  ACCEPTED, // the loan proposal has been accepted by the borrower, but not yet executed
  EXECUTED, // the loan has been executed, transferring the assets from the lender to the borrower
}

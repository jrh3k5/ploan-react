import { EthereumAsset } from "./asset";
import { Identity } from "./identity";

export class PersonalLoan {
  loanID: string;
  borrower: Identity;
  lender: Identity;
  amountLoaned: bigint;
  amountRepaid: bigint;
  asset: EthereumAsset;
  status: LoanStatus;

  constructor(
    loanID: string,
    borrower: Identity,
    lender: Identity,
    amountLoaned: bigint,
    amountRepaid: bigint,
    asset: EthereumAsset,
    status: LoanStatus,
  ) {
    this.loanID = loanID;
    this.borrower = borrower;
    this.lender = lender;
    this.amountLoaned = amountLoaned;
    this.amountRepaid = amountRepaid;
    this.asset = asset;
    this.status = status;
  }
}

export enum LoanStatus {
  UNSPECIFIED,
  IN_PROGRESS,
  COMPLETED,
  CANCELED,
}

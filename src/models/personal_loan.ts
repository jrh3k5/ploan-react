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

  toJSON() {
    return {
      loanID: this.loanID,
      borrower: this.borrower,
      lender: this.lender,
      amountLoaned: `${this.amountLoaned}`, // convert to string because JSON.strinify does not support bigint
      amountRepaid: `${this.amountRepaid}`,
      asset: this.asset,
      status: this.status,
    };
  }
}

export enum LoanStatus {
  UNSPECIFIED,
  IN_PROGRESS,
  COMPLETED,
  CANCELED,
}

// compareByStatus compares two loans so that a list of loans is sorted by their statuses in the order of:
// UNSPECIFIED, IN_PROGRESS, COMPLETED, CANCELED
export function compareByStatus(a: PersonalLoan, b: PersonalLoan): number {
  return a.status - b.status;
}

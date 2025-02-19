import { PersonalLoan } from "@/models/personal_loan";
import { PendingLoan } from "@/models/pending_loan";
import { Identity } from "@/models/identity";

// PloanService is the interface for the personal loan service.
export interface PersonalLoanService {
  // acceptLoan accepts a pending loan where the user is the borrower.
  acceptBorrow(loanID: string): Promise<void>;

  // allowLoanProposal allows a user to propose a loan
  allowLoanProposal(identity: Identity): Promise<void>;

  // cancelLoan cancels a personal loan where the user is the lender.
  cancelLendingLoan(loanID: string): Promise<void>;

  // cancelLoan cancels a pending loan.
  cancelPendingLoan(loanID: string): Promise<void>;

  // disallowLoanProposal disallows a user from proposing a loan to the current user.
  disallowLoanProposal(identity: Identity): Promise<void>;

  // getPersonalLoans gets all personal loans for the current user
  // where the user is the borrower.
  getBorrowingLoans(): Promise<PersonalLoan[]>;

  // getPersonalLoans gets all personal loans for the current user
  // where the user is the lender.
  getLendingLoans(): Promise<PersonalLoan[]>;

  // getLoanProposalAllowlist gets the list of users that are allowed to propose loans
  getLoanProposalAllowlist(): Promise<Identity[]>;

  // getPendingBorrowingLoans gets loans that have been extended to the current user
  // as the borrower and have not yet been accepted by the current user.
  getPendingBorrowingLoans(): Promise<PendingLoan[]>;

  // getPendingLendingLoans gets loans that have been extended by the current user
  // as the lender and have not yet been accepted by the borrower.
  getPendingLendingLoans(): Promise<PendingLoan[]>;

  // proposeoan proposes a new loan
  proposeLoan(
    borrowerAddress: string,
    amount: bigint,
    assetAddress: string,
  ): Promise<void>;

  // rejectBorrow rejects a pending loan where the user is the borrower
  rejectBorrow(loanID: string): Promise<void>;

  // repayLoan repays the given amount into the loan.
  repayLoan(loanID: string, amount: bigint): Promise<void>;
}

import { PersonalLoan } from "@/models/personal_loan";
import { PendingLoan } from "@/models/pending_loan";
import { Identity } from "@/models/identity";
import { EthereumAsset } from "@/models/asset";

// PloanService is the interface for the personal loan service.
export interface PersonalLoanService {
  // acceptLoan accepts a pending loan where the user is the borrower.
  acceptBorrow(loanID: string): Promise<void>;

  // allowLoanProposal allows a user to propose a loan.
  allowLoanProposal(identity: Identity): Promise<void>;

  // approveTransfer approves a token transfer to a recipient from the current user to be executed
  // by this application.
  approveTokenTransfer(
    recipient: Identity,
    asset: EthereumAsset,
    amount: bigint,
  ): Promise<void>;

  // cancelLoan cancels a personal loan where the user is the lender.
  cancelLendingLoan(loanID: string): Promise<void>;

  // cancelLoan cancels a pending loan.
  cancelPendingLoan(loanID: string): Promise<void>;

  // disallowLoanProposal disallows a user from proposing a loan to the current user.
  disallowLoanProposal(identity: Identity): Promise<void>;

  // executeLoan executes an approved loan, moving the funds from the lender to the borrower.
  executeLoan(loanID: string): Promise<void>;

  // getPersonalLoans gets all personal loans for the current user
  // where the user is the borrower.
  getBorrowingLoans(): Promise<PersonalLoan[]>;

  // getPersonalLoans gets all personal loans for the current user
  // where the user is the lender.
  getLendingLoans(): Promise<PersonalLoan[]>;

  // getLoanProposalAllowlist gets the list of users that are allowed to propose loans.
  getLoanProposalAllowlist(): Promise<Identity[]>;

  // getPendingBorrowingLoans gets loans that have been extended to the current user
  // as the borrower and have not yet been accepted by the current user.
  getPendingBorrowingLoans(): Promise<PendingLoan[]>;

  // getPendingLendingLoans gets loans that have been extended by the current user
  // as the lender and have not yet been accepted by the borrower.
  getPendingLendingLoans(): Promise<PendingLoan[]>;

  // getTokenBalance gets the balance of the given token.
  getTokenBalance(contractAddress: `0x${string}`): Promise<bigint>;

  // proposeoan proposes a new loan.
  // Use importLoan to import an existing loan.
  proposeLoan(
    borrowerAddress: string,
    amount: bigint,
    assetAddress: string,
  ): Promise<void>;

  // proposeLoanImport is used to import a pre-existing loan as a proposal.
  // No funds will be transmitted upon execution.
  // Use proposeLoan to create a new loan.
  proposeLoanImport(
    borrowerAddress: string,
    loanAmount: bigint,
    paidAmount: bigint,
    assetAddress: string,
  ): Promise<void>;

  // rejectBorrow rejects a pending loan where the user is the borrower.
  rejectBorrow(loanID: string): Promise<void>;

  // repayLoan repays the given amount into the loan.
  repayLoan(loanID: string, amount: bigint): Promise<void>;
}

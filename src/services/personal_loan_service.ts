import { PersonalLoan } from "@/models/personal_loan";
import { PendingLoan } from "@/models/pending_loan";

// PloanService is the interface for the personal loan service.
export interface PersonalLoanService {
  // acceptLoan accepts a pending loan where the user is the borrower.
  acceptBorrow(loanID: string): Promise<void>;

  // cancelLoan cancels a personal loan where the user is the lender.
  cancelLendingLoan(loanID: string): Promise<void>;

  // cancelLoan cancels a pending loan.
  cancelPendingLoan(loanID: string): Promise<void>;

  // getPersonalLoans gets all personal loans for the current user
  // where the user is the borrower.
  getBorrowingLoans(): Promise<PersonalLoan[]>;

  // getPersonalLoans gets all personal loans for the current user
  // where the user is the lender.
  getLendingLoans(): Promise<PersonalLoan[]>;

  // getPendingBorrowingLoans gets loans that have been extended to the current user
  // as the borrower and have not yet been accepted by the current user.
  getPendingBorrowingLoans(): Promise<PendingLoan[]>;

  // getPendingLendingLoans gets loans that have been extended by the current user
  // as the lender and have not yet been accepted by the borrower.
  getPendingLendingLoans(): Promise<PendingLoan[]>;

  // rejectBorrow rejects a pending loan where the user is the borrower
  rejectBorrow(loanID: string): Promise<void>;
}

import {PersonalLoan} from '@/models/personal_loan';
import {PendingLoan} from '@/models/pending_loan';

// PloanService is the interface for the personal loan service.
export interface PersonalLoanService {
    // getPendingIncomingLoans gets loans that have been extended to the current user
    // as the borrower and have not yet been accepted by the current user.
    getPendingIncomingLoans(): Promise<PendingLoan[]>

    // getPendingOutgoingLoans gets loans that have been extended by the current user
    // as the lender and have not yet been accepted by the borrower.
    getPendingOutgoingLoans(): Promise<PendingLoan[]>

    // getPersonalLoans gets the loans of the current user.
    getPersonalLoans(): Promise<PersonalLoan[]>
}
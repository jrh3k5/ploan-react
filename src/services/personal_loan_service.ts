import {PersonalLoan} from '../models/personal_loan';

// PloanService is the interface for the personal loan service.
export interface PersonalLoanService {
    // getPersonalLoans gets the loans of the current user.
    getPersonalLoans(): Promise<PersonalLoan[]>
}
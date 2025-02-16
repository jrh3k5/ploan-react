'use client'

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { UserIdentity } from './user_identity';
import { LoanProgress } from './loan_progress';
import { PersonalLoan } from '@/models/personal_loan';

export function BorrowingLoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [borrowingLoans, setBorrowingLoans] = useState<PersonalLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getBorrowingLoans().then(retrievedLoans => {
                setBorrowingLoans(retrievedLoans);
            }).catch(error => {
                console.error("Failed to retrieve borrowing loans", error);
            });
        }
    }, []);
    
    if (!borrowingLoans.length) {
        return (
            <div>You are currently borrowing nothing from others</div>
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Lender</th>
                    <th>Amount to Lend</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {borrowingLoans.map((borrowingLoan) => (
                    <tr key={borrowingLoan.loanID}>
                        <td><UserIdentity identity={borrowingLoan.lender} /></td>
                        <td><LoanProgress loan={borrowingLoan} /></td>
                        <td>
                            <button>Repay</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
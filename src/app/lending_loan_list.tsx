'use client'

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { UserIdentity } from './user_identity';
import { LoanProgress } from './loan_progress';
import { PersonalLoan } from '@/models/personal_loan';

export function LendingLoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [lendingLoans, setLendingLoans] = useState<PersonalLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getLendingLoans().then(retrievedLoans => {
                setLendingLoans(retrievedLoans);
            }).catch(error => {
                console.error("Failed to retrieve lending loans", error);
            });
        }
    }, []);
    
    if (!lendingLoans.length) {
        return (
            <div>You have no loans lent out to others</div>
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Borrow</th>
                    <th>Amount to Lend</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {lendingLoans.map((lendingLoan) => (
                    <tr key={lendingLoan.loanID}>
                        <td><UserIdentity identity={lendingLoan.borrower} /></td>
                        <td><LoanProgress loan={lendingLoan} /></td>
                        <td>
                            <button>Cancel</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
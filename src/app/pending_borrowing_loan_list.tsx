'use client'

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { PendingLoan } from '@/models/pending_loan';
import { Asset } from './asset';
import { UserIdentity } from './user_identity';

export function PendingBorrowingLoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [pendingBorrowingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getPendingBorrowingLoans().then(pendingLoans => {
                setPendingLoans(pendingLoans);
            }).catch(error => {
                console.error("Failed to retrieve pending lending loans", error);
            });
        }
    }, []);
    
    if (!pendingBorrowingLoans.length) {
        return (
            <div>You have no pending loans to be accepted</div>
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Lender</th>
                    <th>Amount to Borrow</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {pendingBorrowingLoans.map((pendingLoan) => (
                    <tr key={pendingLoan.loanID}>
                        <td><UserIdentity identity={pendingLoan.lender} /></td>
                        <td>{pendingLoan.amountLoaned.toString()} <Asset asset={pendingLoan.asset} /></td>
                        <td>
                            <button>Accept</button>
                            <button>Reject</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
'use client'

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { PendingLoan } from '@/models/pending_loan';
import { Asset } from './asset';
import { UserIdentity } from './user_identity';

export function PendingLendingLoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getPendingLendingLoans().then(lendingLoans => {
                setPendingLoans(lendingLoans);
            }).catch(error => {
                console.error("Failed to retrieve pending lending loans", error);
            });
        }
    }, []);
    
    if (!pendingLoans.length) {
        return (
            <div>You have no pending loans waiting to be accepted by the borrower</div>
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
                {pendingLoans.map((pendingLoan) => (
                    <tr key={pendingLoan.loanID}>
                        <td><UserIdentity identity={pendingLoan.borrower} /></td>
                        <td>{pendingLoan.amountLoaned.toString()} <Asset asset={pendingLoan.asset} /></td>
                        <td>
                            <button>Cancel</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
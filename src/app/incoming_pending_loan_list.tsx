'use client'

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { PendingLoan } from '@/models/pending_loan';
import { Asset } from './asset';
import { UserIdentity } from './user_identity';

export function IncomingPendingLoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [pendingIncomingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getPendingIncomingLoans().then(incomingLoans => {
                setPendingLoans(incomingLoans);
            }).catch(error => {
                console.error("Failed to retrieve personal loans", error);
            });
        }
    }, []);
    
    if (!pendingIncomingLoans.length) {
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
                {pendingIncomingLoans.map((pendingIncomingLoan) => (
                    <tr key={pendingIncomingLoan.loanID}>
                        <td><UserIdentity identity={pendingIncomingLoan.lender} /></td>
                        <td>{pendingIncomingLoan.amountLoaned.toString()} <Asset asset={pendingIncomingLoan.asset} /></td>
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
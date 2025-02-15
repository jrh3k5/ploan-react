'use client'

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { PendingLoan } from '@/models/pending_loan';
import { Asset } from './asset';

export function OutgoingPendingLoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [pendingOutgoingLoans, setPendingLoans] = useState<PendingLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getPendingOutgoingLoans().then(outgoingLoans => {
                setPendingLoans(outgoingLoans);
            }).catch(error => {
                console.error("Failed to retrieve personal loans", error);
            });
        }
    }, []);
    
    if (!pendingOutgoingLoans.length) {
        return (
            <div>You have no pending loans waiting to be accepted by the borrower</div>
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Borrow</th>
                    <th>Amount to Borrow</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {pendingOutgoingLoans.map((pendingOutgoingLoan) => (
                    <tr key={pendingOutgoingLoan.loanID}>
                        <td>{pendingOutgoingLoan.borrower.address}</td>
                        <td>{pendingOutgoingLoan.amountLoaned.toString()} <Asset asset={pendingOutgoingLoan.asset} /></td>
                        <td>
                            <button>Cancel</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
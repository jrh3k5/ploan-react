'use client';

import { useState, useEffect, useContext } from 'react';
import { PersonalLoanContext } from '@/services/personal_loan_service_provider';
import { PersonalLoan } from '@/models/personal_loan';


export function LoanList() {
    const loanService = useContext(PersonalLoanContext);
    const [loans, setLoans] = useState<PersonalLoan[]>([]);

    useEffect(() => {
        if (loanService) {
            loanService.getPersonalLoans().then(retrievedLoans => {
                setLoans(retrievedLoans);
            }).catch(error => {
                console.error("Failed to retrieve personal loans", error);
            });
        }
    }, []);
    
    if (!loans.length) {
        return (
            <div>
                You have no loans to show
            </div>
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Lender</th>
                    <th>Borrower</th>
                    <th>Repayment Progress</th>
                </tr>
            </thead>
            <tbody>
                {loans.map((loan) => (
                    <tr key={loan.loanID}>
                        <td>{loan.lender.address}</td>
                        <td>{loan.borrower.address}</td>
                        <td>{loan.amountRepaid.toString()}/{loan.amountLoaned.toString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )   
}
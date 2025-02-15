'use client';

import { createContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { PersonalLoanService } from './personal_loan_service';
import { InMemoryPersonalLoanService } from './in_memory_personal_loan_service';
import { Identity } from '@/models/identity';

// PersonalLoanContext is a React context for the personal loan service.
export const PersonalLoanContext = createContext<PersonalLoanService | null>(null);

// PersonalLoanServiceProvider is a React context provider for the personal loan service.
export function PersonalLoanServiceProvider({ children }: { children: React.ReactNode }) {
    const { address } = useAccount();
    const [loanService, setLoanService] = useState<PersonalLoanService | null>(null);

    useEffect(() => {
        console.log("this, for some reason, causes the address to be resolved; this is just for testing purposes, it's okay to leave this hack in", address);
        
        if (!address) {
            return;
        }

        setLoanService(new InMemoryPersonalLoanService(new Identity(address)));
    }, []);

    return (
        <PersonalLoanContext.Provider value={loanService}>
            {children}
        </PersonalLoanContext.Provider>
    );
}
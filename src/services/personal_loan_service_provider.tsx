"use client";

import React, { createContext } from "react";
import { PersonalLoanService } from "./personal_loan_service";
import { InMemoryPersonalLoanService } from "./in_memory_personal_loan_service";

// PersonalLoanContext is a React context for the personal loan service.
export const PersonalLoanContext = createContext<PersonalLoanService | null>(
  null,
);

// PersonalLoanServiceProvider is a React context provider for the personal loan service.
export function PersonalLoanServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loanService = new InMemoryPersonalLoanService();

  return (
    <PersonalLoanContext.Provider value={loanService}>
      {children}
    </PersonalLoanContext.Provider>
  );
}

"use client";

import React, { createContext } from "react";
import { PersonalLoanService } from "./personal_loan_service";
import { InMemoryPersonalLoanService } from "./in_memory_personal_loan_service";
import { WagmiEthereumAssetResolverService } from "./wagmi_ethereum_asset_resolver_service";
import { CachingEthereumAssetResolver } from "./caching_ethereum_asset_resolver";

// PersonalLoanContext is a React context for the personal loan service.
export const PersonalLoanContext = createContext<PersonalLoanService | null>(
  null,
);

type PersonalLoanServiceProviderProps = {
  children: React.ReactNode;
  loanService: PersonalLoanService;
}

// PersonalLoanServiceProvider is a React context provider for the personal loan service.
export function PersonalLoanServiceProvider(props: PersonalLoanServiceProviderProps) {
    const { children, loanService } = props;
    
  return (
    <PersonalLoanContext.Provider value={loanService}>
      {children}
    </PersonalLoanContext.Provider>
  );
}

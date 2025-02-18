"use client";

import React, { createContext } from "react";
import { SupportAssetResolver } from "./supported_asset_resolver";

// SupportAssetResolverContext is a React context for the supported asset resolver.
export const SupportedAssetResolverContext =
  createContext<SupportAssetResolver | null>(null);

type SupportAssetResolverProviderProps = {
  children: React.ReactNode;
  supportedAssetResolver: SupportAssetResolver;
};

// SupportedAssetResolverProvider is a React context provider for the supported asset resolver
export function SupportedAssetResolverProvider(
  props: SupportAssetResolverProviderProps,
) {
  const { children, supportedAssetResolver } = props;

  return (
    <SupportedAssetResolverContext.Provider value={supportedAssetResolver}>
      {children}
    </SupportedAssetResolverContext.Provider>
  );
}

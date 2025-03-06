"use client";

import React, { createContext } from "react";
import {
  ApplicationStateService,
  ApplicationStateSubscriptionService,
} from "./application_state_service";

// ApplicationStateServiceContext is a React context for the application state service
export const ApplicationStateServiceContext = createContext<
  (ApplicationStateService & ApplicationStateSubscriptionService) | null
>(null);

type ApplicationStateServiceProviderProps = {
  children: React.ReactNode;
  appStateService: ApplicationStateService &
    ApplicationStateSubscriptionService;
};

// ApplicationStateServiceProvider is a React context provider for the personal loan service.
export function ApplicationStateServiceProvider(
  props: ApplicationStateServiceProviderProps,
) {
  const { children, appStateService } = props;

  return (
    <ApplicationStateServiceContext.Provider value={appStateService}>
      {children}
    </ApplicationStateServiceContext.Provider>
  );
}

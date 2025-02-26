"use client";

import React, { createContext } from "react";
import { ErrorReporter } from "./error_reporter";

// ConsoleLoggingErrorReporter is a basic implementation of the reporter
// to ensure that an error reporter is always available.
class ConsoleLoggingErrorReporter implements ErrorReporter {
  async reportAny(error: any): Promise<void> {
    console.error(error);
  }

  async reportError(error: Error): Promise<void> {
    console.error(error);
  }

  async reportErrorMessage(message: string): Promise<void> {
    console.error(message);
  }
}

// ErrorReporterContext is a React context for the error reporter.
export const ErrorReporterContext = createContext<ErrorReporter>(
  new ConsoleLoggingErrorReporter(),
);

type ErrorReporterProviderProps = {
  children: React.ReactNode;
  errorReporter: ErrorReporter;
};

// ErrorReporterProvider is a React context provider for the error reporter.
export function ErrorReporterProvider(props: ErrorReporterProviderProps) {
  const { children, errorReporter } = props;

  return (
    <ErrorReporterContext.Provider value={errorReporter}>
      {children}
    </ErrorReporterContext.Provider>
  );
}

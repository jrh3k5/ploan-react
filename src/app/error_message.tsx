"use client";

import { TransactionExecutionError } from "viem";

// ErrorMessageProps defines the properties required by the error message component.
export interface ErrorMessageProps {
  error: any;
}

// ErrorMessage describes a component used to render a human-readable error message to the user.
export function ErrorMessage(props: ErrorMessageProps) {
  const renderError = (error: any) => {
    if (!error) {
      return "";
    }

    const asError = error as Error;
    if (!asError) {
      return `${error}`;
    }

    const txError = asError as TransactionExecutionError;
    if (txError?.details === "User rejected the request.") {
      return "Transaction was rejected by the user.";
    }

    return asError.message;
  };
  return <div className="error">{renderError(props.error)}</div>;
}

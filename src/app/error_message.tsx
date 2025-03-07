"use client";

// ErrorMessageProps defines the properties required by the error message component.
export interface ErrorMessageProps {
  error: Error;
}

// ErrorMessage describes a component used to render a human-readable error message to the user.
export function ErrorMessage(props: ErrorMessageProps) {
  return <div className="error">{props.error.message}</div>;
}

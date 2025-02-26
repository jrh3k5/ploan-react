"use client";

export interface ErrorMessageProps {
  error: Error;
}

export function ErrorMessage(props: ErrorMessageProps) {
  return <div className="error">{props.error.message}</div>;
}

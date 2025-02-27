import { InMemoryErrorReporter } from "@/services/error_reporter";
import { useState } from "react";
import { ErrorMessage } from "./error_message";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

export interface ModalProps {
  children: React.ReactNode;
  onClose: () => Promise<void>;
}

const errorReporter = new InMemoryErrorReporter();

export function Modal(props: ModalProps) {
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  errorReporter.registerErrorListener(async (error) => {
    console.error(error);

    setCapturedError(error);
  });

  return (
    <div className="modal">
      <ErrorReporterContext.Provider value={errorReporter}>
        {capturedError && <ErrorMessage error={capturedError} />}
        {props.children}
      </ErrorReporterContext.Provider>
    </div>
  );
}

import {
  InMemoryErrorReporter,
  registerErrorListener,
} from "@/services/error_reporter";
import { useState } from "react";
import { ErrorReporterProvider } from "@/services/error_reporter_provider";
import { ErrorMessage } from "../error_message";

const errorReporter = new InMemoryErrorReporter();

export interface ModalWrapperProps {
  children: React.ReactNode;
  reportedError?: any;
}

export function ModalWrapper(props: ModalWrapperProps) {
  const [capturedError, setCapturedError] = useState<Error | undefined>(
    undefined,
  );

  registerErrorListener(errorReporter, setCapturedError);

  return (
    <>
      <div className="popup-layout">
        <ErrorReporterProvider errorReporter={errorReporter}>
          {(capturedError || props.reportedError) && (
            <ErrorMessage error={capturedError ?? props.reportedError} />
          )}
          <div>{props.children}</div>
        </ErrorReporterProvider>
      </div>
    </>
  );
}

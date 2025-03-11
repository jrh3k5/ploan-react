import { TransactionExecutionError } from "viem";

// registerErrorListener provides a common means of subscribing to an error, with a timeout to eventually clear the error.
export function registerErrorListener(
  errorReporter: ErrorReportListenerRegistry,
  errorSetter: (error: Error | undefined) => void,
) {
  errorReporter.registerErrorListener(async (error: Error) => {
    console.error(error);

    errorSetter(error);

    // clear the error from the screen
    setTimeout(() => {
      errorSetter(undefined);
    }, 5000);
  });
}

// ErrorReporter defines a means of reporting errors to subscribers.
export interface ErrorReporter {
  // reportAny attempts to report an unknown object as an error
  reportAny(error: any): Promise<void>;

  // reportError reports a captured error
  reportError(error: Error): Promise<void>;

  // reportErrorMessage reports a particular message
  reportErrorMessage(message: string): Promise<void>;
}

// ErrorReportListenerRegistry is a registry for error listeners.
export interface ErrorReportListenerRegistry {
  // registerErrorListener registers a listener for errors
  registerErrorListener(
    listener: (error: Error) => Promise<void>,
  ): Promise<void>;
}

// InMemoryReporter is an in-memory implementation of ErrorReporter
export class InMemoryErrorReporter
  implements ErrorReporter, ErrorReportListenerRegistry
{
  private listeners: ((error: Error) => Promise<void>)[] = [];

  async reportAny(error: any): Promise<void> {
    if (error instanceof Error) {
      await this.reportError(error);
    } else if (typeof error === "string") {
      await this.reportErrorMessage(error);
    } else {
      await this.reportErrorMessage(`Unknown error: ${error}`);
    }
  }

  async reportError(error: Error): Promise<void> {
    await Promise.all(this.listeners.map((listener) => listener(error)));
  }
  async reportErrorMessage(message: string): Promise<void> {
    await this.reportError(new Error(message));
  }

  async registerErrorListener(
    listener: (error: Error) => Promise<void>,
  ): Promise<void> {
    this.listeners.push(listener);
  }
}

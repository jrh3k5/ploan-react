import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UserIdentity } from "./user_identity";

import { ErrorReporterContext } from "@/services/error_reporter_provider";

describe("UserIdentity", () => {
  const identity = { address: "0x1234" } as any;
  let mockResolveEnsName: jest.Mock;
  let mockErrorReporter: {
    reportAny: jest.Mock;
    reportError: jest.Mock;
    reportErrorMessage: jest.Mock;
  };

  beforeEach(() => {
    mockResolveEnsName = jest.fn();
    mockErrorReporter = {
      reportAny: jest.fn(),
      reportError: jest.fn(),
      reportErrorMessage: jest.fn(),
    };
  });

  it("renders the address when no ENS name is resolved", async () => {
    mockResolveEnsName.mockResolvedValueOnce(null);
    render(
      <UserIdentity
        identity={identity}
        resolveEnsNameFn={mockResolveEnsName}
        errorReporter={mockErrorReporter}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/0x1234/i)).toBeInTheDocument();
    });
  });

  it("renders the ENS name when resolved", async () => {
    mockResolveEnsName.mockResolvedValueOnce("alice.eth");
    render(
      <UserIdentity
        identity={identity}
        resolveEnsNameFn={mockResolveEnsName}
        errorReporter={mockErrorReporter}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/alice.eth/i)).toBeInTheDocument();
    });
  });

  it("calls errorReporter.reportAny on ENS resolution error", async () => {
    mockResolveEnsName.mockRejectedValueOnce(new Error("fail"));
    const errorIdentity = { address: "0xdeadbeef" } as any;
    render(
      <ErrorReporterContext.Provider value={mockErrorReporter}>
        <UserIdentity
          identity={errorIdentity}
          resolveEnsNameFn={mockResolveEnsName}
          errorReporter={mockErrorReporter}
        />
      </ErrorReporterContext.Provider>,
    );
    await waitFor(() => {
      expect(mockErrorReporter.reportAny).toHaveBeenCalled();
    });
  });
});

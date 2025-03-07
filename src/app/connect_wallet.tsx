"use client";

import { useConnect } from "wagmi";
import { useContext, useEffect } from "react";
import { ErrorReporterContext } from "@/services/error_reporter_provider";

// ConnectWallet is a component used to offer the user options of what wallets to choose to connect with
export function ConnectWallet() {
  const { connectors, connect, error } = useConnect();
  const errorReporter = useContext(ErrorReporterContext);

  useEffect(() => {
    if (error) {
      errorReporter.reportError(error);
    }
  }, [error, errorReporter]);

  return (
    <div>
      <h2 className="section-title">Connect Wallet</h2>
      {connectors.toReversed().map((connector) => (
        <div key={connector.uid} className="wallet-option">
          <button
            className="wallet-option"
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name === "Injected"
              ? "Metamask and Others"
              : connector.name}
          </button>
        </div>
      ))}
    </div>
  );
}

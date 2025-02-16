"use client";

import { useConnect } from "wagmi";

export function ConnectWallet() {
  const { connectors, connect, error } = useConnect();

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
      {error?.message && <div className="error">{error?.message}</div>}
    </div>
  );
}

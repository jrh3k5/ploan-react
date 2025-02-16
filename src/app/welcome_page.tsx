"use client";

import { ConnectWallet } from "./connect_wallet";

export function WelcomePage() {
  return (
    <div>
      <h1 className="section-title">Welcome to Ploan</h1>

      <div>
        <p>Ploan is a personal loan tracker to help you manage your loans.</p>
        <p>
          It provides a means of tracking the progress of loans and repaying
          them using cryptocurrencies.
        </p>
        <p>
          This application never holds custody of loaned funds; it is merely a
          means of transferring money between lenders and borrowers directly
          from lenders to borrowers, and vice-versa.
        </p>
        <p>To get started, click &quot;connect wallet&quot;, below.</p>
      </div>
      <ConnectWallet />
    </div>
  );
}

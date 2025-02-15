'use client'

import { useConnect } from 'wagmi'

export function ConnectWallet() {
    const { connectors, connect, error } = useConnect()

    return (
        <div>
            <h2>Connect Wallet</h2>
            {connectors.map((connector) => (
            <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
            >
                {connector.name}
            </button>
            ))}
            <div>{error?.message}</div>
        </div>
    )
}
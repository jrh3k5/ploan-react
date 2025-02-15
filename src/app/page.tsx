'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectWallet } from './connect_wallet'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' ? (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </>
  )
}

export default App

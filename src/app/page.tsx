'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWallet } from './connect_wallet'
import { LoanManagement } from './loan_management'
import { PersonalLoanServiceProvider } from '@/services/personal_loan_service_provider'

function App() {
  const account = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <>
      <div>
        {account.status === 'connected' ? (
            <div>            
                <button type="button" onClick={() => disconnect()}>
                    Disconnect
                </button>

                <PersonalLoanServiceProvider>
                    <LoanManagement />
                </PersonalLoanServiceProvider>
            </div>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </>
  )
}

export default App

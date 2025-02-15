'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWallet } from './connect_wallet'
import { LoanList } from './loan_list'
import { PersonalLoanServiceProvider } from '@/services/personal_loan_service_provider'
import { IncomingPendingLoanList } from './incoming_pending_loan_list'
import { OutgoingPendingLoanList } from './outgoing_pending_loan_list'

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
                    <IncomingPendingLoanList />
                    <OutgoingPendingLoanList />
                    <LoanList />
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

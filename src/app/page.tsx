'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWallet } from './connect_wallet'
import { BorrowingLoanList } from './borrowing_loan_list'
import { LendingLoanList } from './lending_loan_list'
import { PersonalLoanServiceProvider } from '@/services/personal_loan_service_provider'
import { PendingBorrowingLoanList } from './pending_borrowing_loan_list'
import { PendingLendingLoanList } from './pending_lending_loan_list'

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
                    <PendingBorrowingLoanList />
                    <PendingLendingLoanList />
                    <BorrowingLoanList />
                    <LendingLoanList />
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

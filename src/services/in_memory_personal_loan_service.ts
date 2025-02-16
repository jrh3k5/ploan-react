import { EthereumAsset } from '@/models/asset';
import {PersonalLoan} from '@/models/personal_loan';
import { PersonalLoanService } from '@/services/personal_loan_service';
import { Identity } from '@/models/identity';
import { PendingLoan } from '@/models/pending_loan';

const usdcAsset = new EthereumAsset(
    8453,
    "USDC",
    6,
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
);

const degenAsset = new EthereumAsset(
    8453,
    "DEGEN",
    18,
    "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed"
);

const vbuterin = new Identity(
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
);

const barmstrong = new Identity(
    "0x5b76f5B8fc9D700624F78208132f91AD4e61a1f0",
);

// InMemoryPersonalLoanService is the in-memory implementation of the personal loan service.
// This is useful for testing functionlity without any onchain dependencies.
export class InMemoryPersonalLoanService implements PersonalLoanService {
    user: Identity;
    pendingBorrowingLoans: PendingLoan[] = [];
    pendingLendingLoans: PendingLoan[] = [];
    borrowingLoans: PersonalLoan[] = [];
    lendingLoans: PersonalLoan[] = [];

    constructor() {
        this.user = new Identity("0x9134fc7112b478e97eE6F0E6A7bf81EcAfef19ED");
        
        this.pendingBorrowingLoans = [
            new PendingLoan(
                "5",
                vbuterin,
                this.user,
                1000n,
                usdcAsset,
            )
        ];

        this.pendingLendingLoans = [
            new PendingLoan(
                "6",
                this.user,
                barmstrong,
                1000n,
                degenAsset,
            )
        ];

        this.borrowingLoans = [
            new PersonalLoan(
                "3",
                this.user,
                barmstrong,
                250n,
                50n,
                usdcAsset,
            ),
            new PersonalLoan(
                "4",
                this.user,
                vbuterin,
                250n,
                50n,
                degenAsset,
            )
        ];

        this.lendingLoans = [
            new PersonalLoan(
                "1",
                vbuterin,
                this.user,
                1000n,
                250n,
                usdcAsset,
            ),
            new PersonalLoan(
                "2",
                barmstrong,
                this.user,
                1000n,
                250n,
                degenAsset,
            )
        ];
    }

    async getBorrowingLoans(): Promise<PersonalLoan[]> {
        return this.borrowingLoans;
    }

    async getLendingLoans(): Promise<PersonalLoan[]> {
        return this.lendingLoans;
    }

    async getPendingBorrowingLoans(): Promise<PendingLoan[]> {
        return this.pendingBorrowingLoans;
    }

    async getPendingLendingLoans(): Promise<PendingLoan[]> {
        return this.pendingLendingLoans;
    }
}   
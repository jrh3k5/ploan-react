import { EthereumAsset } from '@/models/asset';
import {PersonalLoan} from '../models/personal_loan';
import { PersonalLoanService } from './personal_loan_service';
import { Identity } from '@/models/identity';
import { useAccount } from 'wagmi';

// InMemoryPersonalLoanService is the in-memory implementation of the personal loan service.
// This is useful for testing functionlity without any onchain dependencies.
export class InMemoryPersonalLoanService implements PersonalLoanService {
    async getPersonalLoans(): Promise<PersonalLoan[]> {
        // const account = useAccount()

        // if (account.status !== 'connected') {
        //     return [];
        // }

        const user = new Identity("0x9134fc7112b478e97eE6F0E6A7bf81EcAfef19ED");

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

        const lenderLoan0 = new PersonalLoan(
            "1",
            vbuterin,
            user,
            1000n,
            250n,
            usdcAsset,
        );
        
        const lenderLoan1 = new PersonalLoan(
            "2",
            barmstrong,
            user,
            1000n,
            250n,
            degenAsset,
        )

        const borrowerLoan0 = new PersonalLoan(
            "3",
            user,
            barmstrong,
            250n,
            50n,
            usdcAsset,
        );

        const borrowerLoan1 = new PersonalLoan(
            "4",
            user,
            vbuterin,
            250n,
            50n,
            degenAsset,
        );

        return [
            lenderLoan0,
            lenderLoan1,
            borrowerLoan0,
            borrowerLoan1
        ];
    }
}   
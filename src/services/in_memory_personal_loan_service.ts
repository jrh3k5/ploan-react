import { EthereumAsset } from "@/models/asset";
import { PersonalLoan, LoanStatus } from "@/models/personal_loan";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { Identity } from "@/models/identity";
import { PendingLoan } from "@/models/pending_loan";
import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";

const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const degenAddress = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";

const vbuterin = new Identity("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");

const barmstrong = new Identity("0x5b76f5B8fc9D700624F78208132f91AD4e61a1f0");

// InMemoryPersonalLoanService is the in-memory implementation of the personal loan service.
// This is useful for testing functionlity without any onchain dependencies.
export class InMemoryPersonalLoanService implements PersonalLoanService {
  private ethereumAssetResolverService: EthereumAssetResolverService;
  private user: Identity;
  private chainId: number;
  private pendingBorrowingLoans: PendingLoan[] | undefined = undefined;
  private pendingLendingLoans: PendingLoan[] | undefined = undefined;
  private borrowingLoans: PersonalLoan[] | undefined = undefined;
  private lendingLoans: PersonalLoan[] | undefined = undefined;

  constructor(
    chainId: number,
    ethereumAssetResolverService: EthereumAssetResolverService,
  ) {
    this.chainId = chainId;
    this.ethereumAssetResolverService = ethereumAssetResolverService;
    this.user = new Identity("0x9134fc7112b478e97eE6F0E6A7bf81EcAfef19ED");
  }

  async acceptBorrow(loanID: string): Promise<void> {
    let pendingBorrowingLoans = await this.getOrInitBorrowLoans();

    for (let i = pendingBorrowingLoans.length - 1; i >= 0; i--) {
      if (pendingBorrowingLoans[i].loanID === loanID) {
        const newLoan = pendingBorrowingLoans[i];

        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingBorrowingLoans = pendingBorrowingLoans
          .slice(0, i)
          .concat(pendingBorrowingLoans.slice(i + 1));

        const borrowingLoans = await this.getBorrowingLoans();
        this.borrowingLoans = borrowingLoans.concat([
          new PersonalLoan(
            newLoan.loanID,
            newLoan.borrower,
            newLoan.lender,
            newLoan.amountLoaned,
            0n,
            newLoan.asset,
            LoanStatus.IN_PROGRESS,
          ),
        ]);
      }
    }
  }

  async cancelLendingLoan(loanID: string): Promise<void> {
    const lendingLoans = await this.getOrInitLendingLoans();

    for (let i = lendingLoans.length - 1; i >= 0; i--) {
      if (lendingLoans[i].loanID === loanID) {
        lendingLoans[i].status = LoanStatus.CANCELED;
      }
    }

    // Completely rebuild the array to trigger a refresh of the data
    this.lendingLoans = [];
    this.lendingLoans.push(...lendingLoans);
  }

  async cancelPendingLoan(loanID: string): Promise<void> {
    let pendingLendingLoans = await this.getOrInitPendingLendingLoans();

    for (let i = pendingLendingLoans.length - 1; i >= 0; i--) {
      if (pendingLendingLoans[i].loanID === loanID) {
        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingLendingLoans = pendingLendingLoans
          .slice(0, i)
          .concat(pendingLendingLoans.slice(i + 1));
      }
    }

    this.pendingLendingLoans = [];
    this.pendingLendingLoans.push(...pendingLendingLoans);
  }

  async getBorrowingLoans(): Promise<PersonalLoan[]> {
    return this.getOrInitBorrowLoans();
  }

  async getLendingLoans(): Promise<PersonalLoan[]> {
    return this.getOrInitLendingLoans();
  }

  // getOrInitBorrowLoans retrieves the current borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitBorrowLoans(): Promise<PersonalLoan[]> {
    if (!this.borrowingLoans) {
      const usdcAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        usdcAddress,
      );
      if (!usdcAsset) {
        throw new Error("Failed to resolve USDC as an asset: " + usdcAddress);
      }

      const degenAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        degenAddress,
      );
      if (!degenAsset) {
        throw new Error("Failed to resolve DEGEN as an asset: " + degenAddress);
      }

      this.borrowingLoans = [
        new PersonalLoan(
          "3",
          this.user,
          barmstrong,
          250000000n,
          50000000n,
          usdcAsset,
          LoanStatus.IN_PROGRESS,
        ),
        new PersonalLoan(
          "4",
          this.user,
          vbuterin,
          250000000000000000000n,
          50000000000000000000n,
          degenAsset,
          LoanStatus.IN_PROGRESS,
        ),
      ];
    }

    return this.borrowingLoans;
  }

  //getOrInitLendingLoans retrieves the current borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitLendingLoans(): Promise<PersonalLoan[]> {
    if (!this.lendingLoans) {
      const usdcAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        usdcAddress,
      );
      if (!usdcAsset) {
        throw new Error("Failed to resolve USDC as an asset: " + usdcAddress);
      }

      const degenAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        degenAddress,
      );
      if (!degenAsset) {
        throw new Error("Failed to resolve DEGEN as an asset: " + degenAddress);
      }

      this.lendingLoans = [
        new PersonalLoan(
          "1",
          vbuterin,
          this.user,
          1000000000n,
          250000000n,
          usdcAsset,
          LoanStatus.IN_PROGRESS,
        ),
        new PersonalLoan(
          "2",
          barmstrong,
          this.user,
          1000000000000000000000n,
          250000000000000000000n,
          degenAsset,
          LoanStatus.IN_PROGRESS,
        ),
      ];
    }

    return this.lendingLoans;
  }

  // getOrInitPendingBorrowLoans retrieves the current pending borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitPendingBorrowingLoans(): Promise<PendingLoan[]> {
    if (!this.pendingBorrowingLoans) {
      const usdcAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        usdcAddress,
      );
      if (!usdcAsset) {
        throw new Error("Failed to resolve USDC as an asset: " + usdcAddress);
      }

      this.pendingBorrowingLoans = [
        new PendingLoan("5", vbuterin, this.user, 1000000000n, usdcAsset),
      ];
    }

    return this.pendingBorrowingLoans;
  }

  // getOrInitPendingLendingLoans retrieves the current pending borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitPendingLendingLoans(): Promise<PendingLoan[]> {
    if (!this.pendingLendingLoans) {
      const degenAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        degenAddress,
      );
      if (!degenAsset) {
        throw new Error("Failed to resolve DEGEN as an asset: " + degenAddress);
      }

      this.pendingLendingLoans = [
        new PendingLoan("6", this.user, barmstrong, 1000000000000000000000n, degenAsset),
      ];
    }

    return this.pendingLendingLoans;
  }

  async getPendingBorrowingLoans(): Promise<PendingLoan[]> {
    return this.getOrInitPendingBorrowingLoans();
  }

  async getPendingLendingLoans(): Promise<PendingLoan[]> {
    return this.getOrInitPendingLendingLoans();
  }

  // purgeData clears the data stored in-memory, allowing the simulation of a fresh start (e.g., a chain change).
  async purgeData(): Promise<void> {
    this.borrowingLoans = undefined;
    this.lendingLoans = undefined;
    this.pendingBorrowingLoans = undefined;
    this.pendingLendingLoans = undefined;
  }

  async rejectBorrow(loanID: string): Promise<void> {
    let pendingBorrowingLoans = await this.getOrInitPendingBorrowingLoans();

    for (let i = pendingBorrowingLoans.length - 1; i >= 0; i--) {
      if (pendingBorrowingLoans[i].loanID === loanID) {
        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingBorrowingLoans = pendingBorrowingLoans
          .slice(0, i)
          .concat(pendingBorrowingLoans.slice(i + 1));
      }
    }

    this.pendingBorrowingLoans = [];
    this.pendingBorrowingLoans.push(...pendingBorrowingLoans);
  }

  async repayLoan(loanID: string, amount: bigint): Promise<void> {
    const borrowingLoans = await this.getOrInitBorrowLoans();

    const repayableLoan = borrowingLoans.find((loan) => loan.loanID === loanID);

    if (!repayableLoan) {
      throw new Error("Loan not found for ID: " + loanID);
    }

    if (repayableLoan.amountRepaid + amount > repayableLoan.amountLoaned) {
      throw new Error("Cannot repay more than the loan amount");
    }

    repayableLoan.amountRepaid += amount;
    if (repayableLoan.amountRepaid === repayableLoan.amountLoaned) {
      repayableLoan.status = LoanStatus.COMPLETED;
    }

    // Rebuild the list of loans to cause a UI refresh
    this.borrowingLoans = [];
    this.borrowingLoans.push(...borrowingLoans);
  }

  async setChainId(chainId: number): Promise<void> {
    this.chainId = chainId;
  }
}

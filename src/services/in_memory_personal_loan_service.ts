import { EthereumAsset } from "@/models/asset";
import { PersonalLoan, LoanStatus } from "@/models/personal_loan";
import { PersonalLoanService } from "@/services/personal_loan_service";
import { Identity } from "@/models/identity";
import { PendingLoan } from "@/models/pending_loan";
import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";

const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
const degenAddress = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";

const vbuterin = new Identity("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");

const barmstrong = new Identity("0x5b76f5B8fc9D700624F78208132f91AD4e61a1f0");

// InMemoryPersonalLoanService is the in-memory implementation of the personal loan service.
// This is useful for testing functionlity without any onchain dependencies.
export class InMemoryPersonalLoanService implements PersonalLoanService {
  private ethereumAssetResolverService: EthereumAssetResolverService;
  private userAddress: string | null;
  private chainId: number | null;
  private pendingBorrowingLoans: PendingLoan[] | undefined = undefined;
  private pendingLendingLoans: PendingLoan[] | undefined = undefined;
  private borrowingLoans: PersonalLoan[] | undefined = undefined;
  private lendingLoans: PersonalLoan[] | undefined = undefined;
  private idCounter: number;
  private loanProposalAllowlist: Map<string, string[]> = new Map();

  constructor(ethereumAssetResolverService: EthereumAssetResolverService) {
    this.idCounter = 0;
    this.userAddress = null;
    this.chainId = null;
    this.ethereumAssetResolverService = ethereumAssetResolverService;
  }

  async acceptBorrow(loanID: string): Promise<void> {
    let pendingBorrowingLoans = await this.getOrInitPendingBorrowingLoans();

    for (let i = pendingBorrowingLoans.length - 1; i >= 0; i--) {
      if (pendingBorrowingLoans[i].loanID === loanID) {
        const newLoan = pendingBorrowingLoans[i];

        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingBorrowingLoans = pendingBorrowingLoans
          .slice(0, i)
          .concat(pendingBorrowingLoans.slice(i + 1));

        this.pendingBorrowingLoans = [];
        this.pendingBorrowingLoans.push(...pendingBorrowingLoans);

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

  async allowLoanProposal(identity: Identity): Promise<void> {
    if (!this.userAddress) {
        throw new Error(
          "A user address is required to be set to allow a loan proposal.",
        )
    }
      
    if (!this.loanProposalAllowlist.has(this.userAddress)) {
      this.loanProposalAllowlist.set(this.userAddress, []);
    }

    this.loanProposalAllowlist.get(this.userAddress)?.push(identity.address);
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

  async disallowLoanProposal(identity: Identity): Promise<void> {
    if (!this.userAddress) {
        throw new Error(
          "A user address is required to be set to disallow a loan proposal.",
        )
    }
      
    let allowlist: string[];
    if (!this.loanProposalAllowlist.has(this.userAddress)) {
        allowlist = [];
    } else {
        allowlist = this.loanProposalAllowlist.get(this.userAddress)!;
    }

    for (let i = allowlist.length - 1; i >= 0; i--) {
      if (allowlist[i] === identity.address) {
        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        allowlist = allowlist
          .slice(0, i)
          .concat(allowlist.slice(i + 1));
      }
    }

    this.loanProposalAllowlist.set(this.userAddress, allowlist);
  }

  async getBorrowingLoans(): Promise<PersonalLoan[]> {
    return this.getOrInitBorrowLoans();
  }

  async getLendingLoans(): Promise<PersonalLoan[]> {
    return this.getOrInitLendingLoans();
  }

  // getOrInitBorrowLoans retrieves the current borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitBorrowLoans(): Promise<PersonalLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;

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

      const userIdentity = new Identity(userAddress);

      this.borrowingLoans = [
        new PersonalLoan(
          `${this.idCounter++}`,
          userIdentity,
          barmstrong,
          250000000n,
          50000000n,
          usdcAsset,
          LoanStatus.IN_PROGRESS,
        ),
        new PersonalLoan(
          `${this.idCounter++}`,
          userIdentity,
          vbuterin,
          250000000000000000000n,
          50000000000000000000n,
          degenAsset,
          LoanStatus.IN_PROGRESS,
        ),
      ];
    }

    return this.borrowingLoans.filter(
      (l) => l.borrower.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  //getOrInitLendingLoans retrieves the current borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitLendingLoans(): Promise<PersonalLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;

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

      const userIdentity = new Identity(userAddress);

      this.lendingLoans = [
        new PersonalLoan(
          `${this.idCounter++}`,
          vbuterin,
          userIdentity,
          1000000000n,
          250000000n,
          usdcAsset,
          LoanStatus.IN_PROGRESS,
        ),
        new PersonalLoan(
          `${this.idCounter++}`,
          barmstrong,
          userIdentity,
          1000000000000000000000n,
          250000000000000000000n,
          degenAsset,
          LoanStatus.IN_PROGRESS,
        ),
      ];
    }

    return this.lendingLoans.filter(
      (l) => l.lender.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  // getOrInitPendingBorrowLoans retrieves the current pending borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitPendingBorrowingLoans(): Promise<PendingLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;

    if (!this.pendingBorrowingLoans) {
      const usdcAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        usdcAddress,
      );
      if (!usdcAsset) {
        throw new Error("Failed to resolve USDC as an asset: " + usdcAddress);
      }

      this.pendingBorrowingLoans = [
        new PendingLoan(
          `${this.idCounter++}`,
          vbuterin,
          new Identity(userAddress),
          1000000000n,
          usdcAsset,
        ),
      ];
    }

    return this.pendingBorrowingLoans.filter(
      (l) => l.borrower.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  // getOrInitPendingLendingLoans retrieves the current pending borrowed loans and initializes the data if it's not already been initialized.
  async getOrInitPendingLendingLoans(): Promise<PendingLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;

    if (!this.pendingLendingLoans) {
      const degenAsset = await this.ethereumAssetResolverService.getAsset(
        this.chainId,
        degenAddress,
      );
      if (!degenAsset) {
        throw new Error("Failed to resolve DEGEN as an asset: " + degenAddress);
      }

      this.pendingLendingLoans = [
        new PendingLoan(
          `${this.idCounter++}`,
          new Identity(userAddress),
          barmstrong,
          1000000000000000000000n,
          degenAsset,
        ),
      ];
    }

    return this.pendingLendingLoans.filter(
      (l) => l.lender.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  async getPendingBorrowingLoans(): Promise<PendingLoan[]> {
    return this.getOrInitPendingBorrowingLoans();
  }

  async getPendingLendingLoans(): Promise<PendingLoan[]> {
    return this.getOrInitPendingLendingLoans();
  }

  async proposeLoan(
    borrowerAddress: string,
    amount: bigint,
    assetAddress: string,
  ): Promise<void> {
    if (!this.userAddress) {
      throw new Error(
        "A user address is required to be set to propose a loan.",
      );
    }

    if (!this.chainId) {
      throw new Error("A chain ID is required to be set to propose a loan.");
    }

    const loanedAsset = await this.ethereumAssetResolverService.getAsset(
      this.chainId,
      assetAddress,
    );
    if (!loanedAsset) {
      throw new Error(
        "Failed to resolve loaned asset during loan proposal: " + assetAddress,
      );
    }

    let pendingLoans = this.pendingLendingLoans;
    if (!pendingLoans) {
      pendingLoans = [];
    }

    this.pendingLendingLoans = pendingLoans.concat(
      new PendingLoan(
        `${this.idCounter++}`,
        new Identity(this.userAddress),
        new Identity(borrowerAddress),
        amount,
        loanedAsset,
      ),
    );
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

  async setUserAddress(userAddress: string): Promise<void> {
    this.userAddress = userAddress;
  }
}

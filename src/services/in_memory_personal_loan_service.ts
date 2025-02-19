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
  private pendingLoans: PendingLoan[] | undefined = undefined;
  private activeLoans: PersonalLoan[] | undefined = undefined;
  private idCounter: number;
  private loanProposalAllowlist: Map<string, string[]> = new Map();

  constructor(ethereumAssetResolverService: EthereumAssetResolverService) {
    this.idCounter = 0;
    this.userAddress = null;
    this.chainId = null;
    this.ethereumAssetResolverService = ethereumAssetResolverService;
  }

  async acceptBorrow(loanID: string): Promise<void> {
    let pendingBorrowingLoans = await this.getOrInitPendingLoans();

    for (let i = pendingBorrowingLoans.length - 1; i >= 0; i--) {
      if (pendingBorrowingLoans[i].loanID === loanID) {
        const newLoan = pendingBorrowingLoans[i];

        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingBorrowingLoans = pendingBorrowingLoans
          .slice(0, i)
          .concat(pendingBorrowingLoans.slice(i + 1));

        this.pendingLoans = pendingBorrowingLoans;

        const activeLoans = await this.getOrInitActiveLoans();
        this.activeLoans = activeLoans.concat([
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
      );
    }

    if (!this.loanProposalAllowlist.has(this.userAddress)) {
      this.loanProposalAllowlist.set(this.userAddress, []);
    }

    this.loanProposalAllowlist.get(this.userAddress)?.push(identity.address);
  }

  async cancelLendingLoan(loanID: string): Promise<void> {
    const activeLoans = await this.getOrInitActiveLoans();

    for (let i = activeLoans.length - 1; i >= 0; i--) {
      if (activeLoans[i].loanID === loanID) {
        activeLoans[i].status = LoanStatus.CANCELED;
      }
    }
  }

  async cancelPendingLoan(loanID: string): Promise<void> {
    let pendingLendingLoans = await this.getOrInitPendingLoans();

    for (let i = pendingLendingLoans.length - 1; i >= 0; i--) {
      if (pendingLendingLoans[i].loanID === loanID) {
        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingLendingLoans = pendingLendingLoans
          .slice(0, i)
          .concat(pendingLendingLoans.slice(i + 1));

        this.pendingLoans = pendingLendingLoans;
      }
    }
  }

  async disallowLoanProposal(identity: Identity): Promise<void> {
    if (!this.userAddress) {
      throw new Error(
        "A user address is required to be set to disallow a loan proposal.",
      );
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
        allowlist = allowlist.slice(0, i).concat(allowlist.slice(i + 1));
      }
    }

    this.loanProposalAllowlist.set(this.userAddress, allowlist);
  }

  async getBorrowingLoans(): Promise<PersonalLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;
    const activeLoans = await this.getOrInitActiveLoans();

    return activeLoans.filter(
      (loan) =>
        loan.borrower.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  async getLendingLoans(): Promise<PersonalLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;
    const activeLoans = await this.getOrInitActiveLoans();

    return activeLoans.filter(
      (loan) => loan.lender.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  async getLoanProposalAllowlist(): Promise<Identity[]> {
    if (!this.userAddress) {
      throw new Error(
        "A user address is required to be set to get loan proposal allowlist.",
      );
    }

    if (!this.loanProposalAllowlist.has(this.userAddress)) {
      return [];
    }

    const allowedAddresses = this.loanProposalAllowlist.get(this.userAddress)!;

    return allowedAddresses.map((address) => new Identity(address));
  }

  // getOrInitActiveLoans retrieves the current active loans and initializes the data if it's not already been initialized.
  async getOrInitActiveLoans(): Promise<PersonalLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;

    if (!this.activeLoans) {
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

      this.activeLoans = [
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

    return this.activeLoans;
  }

  async getOrInitPendingLoans(): Promise<PendingLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const userAddress = this.userAddress;

    if (!this.pendingLoans) {
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

      this.pendingLoans = [
        new PendingLoan(
          `${this.idCounter++}`,
          vbuterin,
          new Identity(userAddress),
          1000000000n,
          usdcAsset,
        ),
        new PendingLoan(
          `${this.idCounter++}`,
          new Identity(userAddress),
          barmstrong,
          1000000000000000000000n,
          degenAsset,
        ),
      ];
    }

    return this.pendingLoans;
  }

  async getPendingBorrowingLoans(): Promise<PendingLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const pendingLoans = await this.getOrInitPendingLoans();

    const userAddress = this.userAddress;

    return pendingLoans.filter(
      (l) => l.borrower.address.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  async getPendingLendingLoans(): Promise<PendingLoan[]> {
    if (!this.userAddress || !this.chainId) {
      return [];
    }

    const pendingLoans = await this.getOrInitPendingLoans();

    const userAddress = this.userAddress;

    return pendingLoans.filter(
      (l) => l.lender.address.toLowerCase() === userAddress.toLowerCase(),
    );
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

    const borrowerAllowlist = this.loanProposalAllowlist.get(borrowerAddress);
    if (!borrowerAllowlist) {
      throw new Error(
        "Borrower has no allowlist set; lender cannot propose a loan",
      );
    } else if (!borrowerAllowlist.includes(this.userAddress)) {
      throw new Error(
        "Borrower is not on the allowlist; lender cannot propose a loan",
      );
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

    const pendingLoans = await this.getOrInitPendingLoans();

    this.pendingLoans = pendingLoans.concat(
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
    let pendingBorrowingLoans = await this.getOrInitPendingLoans();

    for (let i = pendingBorrowingLoans.length - 1; i >= 0; i--) {
      if (pendingBorrowingLoans[i].loanID === loanID) {
        // create a new array except with pendingLoans[i] removed
        // this needs to be a new array to trigger a refresh
        pendingBorrowingLoans = pendingBorrowingLoans
          .slice(0, i)
          .concat(pendingBorrowingLoans.slice(i + 1));
      }
    }

    this.pendingLoans = pendingBorrowingLoans;
  }

  async repayLoan(loanID: string, amount: bigint): Promise<void> {
    const borrowingLoans = await this.getOrInitActiveLoans();

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
  }

  async setChainId(chainId: number): Promise<void> {
    this.chainId = chainId;
  }

  async setUserAddress(userAddress: string): Promise<void> {
    this.userAddress = userAddress;
  }
}

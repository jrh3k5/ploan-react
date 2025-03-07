import { EthereumAsset } from "@/models/asset";
import { Identity } from "@/models/identity";
import { PendingLoan, PendingLoanStatus } from "@/models/pending_loan";
import { PersonalLoan, LoanStatus } from "@/models/personal_loan";
import { ContractResolver } from "./contract_resolver";
import { PersonalLoanService } from "./personal_loan_service";
import { PublicClient, WalletClient } from "viem";
import { ploanABI } from "./abi/ploan/abi_v0.6.0";
import { Account, Chain } from "viem";
import { poll } from "./poller";
import { EthereumAssetResolverService } from "./ethereum_asset_resolver_service";

const defaultPollFrequencyMillis = 1000;
const defaultPollMaxTries = 10;

export class OnchainPersonalLoanService implements PersonalLoanService {
  private contractResolver: ContractResolver;
  private assetResolver: EthereumAssetResolverService;
  private publicClient: PublicClient | undefined;
  private walletClient: WalletClient | undefined;

  constructor(
    contractResolver: ContractResolver,
    assetResolver: EthereumAssetResolverService,
  ) {
    this.contractResolver = contractResolver;
    this.assetResolver = assetResolver;
  }

  async acceptBorrow(loanID: string): Promise<void> {
    await this.assertCanWrite();

    await this.writeContract(
      undefined,
      "commitToLoan",
      undefined,
      async () => {
        return [BigInt(loanID)];
      },
      async () => {},
    );

    await this.waitForLoanState(loanID, (l) => l?.isAtLeastAccepted() ?? false);
  }

  async allowLoanProposal(identity: Identity): Promise<void> {
    await this.assertCanWrite();

    await this.writeContract(
      undefined,
      "allowLoanProposal",
      undefined,
      async () => {
        return [identity.address];
      },
      async () => {},
    );

    await this.waitForAllowlistModification(identity.address, true);
  }

  async approveTokenTransfer(
    _: Identity,
    asset: EthereumAsset,
    amount: bigint,
  ): Promise<void> {
    await this.assertCanWrite();

    const thisAddress = await this.resolveContractAddress();

    const approveResult = await this.writeContract(
      asset.address,
      "approve",
      [
        {
          inputs: [
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      async () => {
        return [thisAddress, amount];
      },
      async (results) => {
        return results === true;
      },
    );

    if (!approveResult) {
      throw new Error("Failed to approve token transfer");
    }

    // Wait for the allowance to be reflected in the contract
    await poll(
      defaultPollFrequencyMillis,
      async () => {
        const allowance = await this.readContract(
          asset.address,
          "allowance",
          [
            {
              inputs: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
              ],
              name: "allowance",
              outputs: [{ name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          async (account) => {
            return [account.address, thisAddress];
          },
          async (result) => {
            return BigInt(result);
          },
        );
        return allowance >= amount;
      },
      defaultPollMaxTries,
    );
  }

  // assertCanWrite ensures that the service is in a state that allows it to make write calls.
  async assertCanWrite() {
    const canWrite = await this.canWrite();
    if (!canWrite) {
      throw new Error("Not yet in a state to write");
    }
  }

  async cancelLendingLoan(loanID: string): Promise<void> {
    await this.assertCanWrite();

    await this.writeContract(
      undefined,
      "cancelLoan",
      undefined,
      async () => {
        return [BigInt(loanID)];
      },
      async () => {},
    );

    await this.waitForLoanState(loanID, (l) => l?.isCanceled() ?? false);
  }

  async cancelPendingLoan(loanID: string): Promise<void> {
    await this.assertCanWrite();

    await this.writeContract(
      undefined,
      "cancelPendingLoan",
      undefined,
      async () => {
        return [BigInt(loanID)];
      },
      async () => {},
    );

    await this.waitForLoanExistence(loanID, false);
  }

  // canRead indicates if there is sufficient state initialized in this service
  async canRead(): Promise<boolean> {
    if (!this.publicClient) {
      console.debug("Not in a state to read; public client is not set");

      return false;
    }

    if (!this.walletClient) {
      console.debug("Not in a state to read; wallet client is not set");

      return false;
    }

    const walletAccount = await this.getCurrentAccount();
    if (!walletAccount) {
      console.debug("Not in a state to read; wallet account is not set");

      return false;
    }

    const currentChain = await this.getCurrentChain();
    if (!currentChain) {
      console.debug("Not in a state to read; current chain is not set");

      return false;
    }

    return true;
  }

  // canWrite indicates if there is sufficient state initialized in this service
  // to perform a write.
  async canWrite(): Promise<boolean> {
    if (!this.publicClient) {
      console.debug("Not in a state to write; public client is not set");

      return false;
    }

    if (!this.walletClient) {
      console.debug("Not in a state to write; wallet client is not set");

      return false;
    }

    const walletAccount = await this.getCurrentAccount();
    if (!walletAccount) {
      console.debug(
        "Not in a state to write; wallet client account is not set",
      );

      return false;
    }

    const currentChain = await this.getCurrentChain();
    if (!currentChain) {
      console.debug("Not in a state to write; current chain is not set");

      return false;
    }

    return true;
  }

  async disallowLoanProposal(identity: Identity): Promise<void> {
    await this.assertCanWrite();

    await this.writeContract(
      undefined,
      "disallowLoanProposal",
      undefined,
      async () => {
        return [identity.address];
      },
      async () => {},
    );

    await this.waitForAllowlistModification(identity.address, false);
  }

  async executeLoan(loanID: string): Promise<void> {
    await this.assertCanWrite();

    await this.writeContract(
      undefined,
      "executeLoan",
      undefined,
      async () => {
        return [BigInt(loanID)];
      },
      async () => {},
    );

    await this.waitForLoanState(loanID, (l) => l?.isAtLeastExecuted() ?? false);
  }

  async getBorrowingLoans(): Promise<PersonalLoan[]> {
    const canRead = await this.canRead();
    if (!canRead) {
      console.debug(
        "Not yet in a state to read; returning an empty borrowing loan list",
      );

      return [];
    }

    const currentAccount = await this.getCurrentAccount();

    return (await this.getAllLoans())
      .filter(
        (l) =>
          !l.isPending() && l.getBorrower().address === currentAccount!.address,
      )
      .map((l) => l.asPersonalLoan());
  }

  async getLendingLoans(): Promise<PersonalLoan[]> {
    const canRead = await this.canRead();
    if (!canRead) {
      console.debug(
        "Not yet in a state to read; returning an empty pending loan list",
      );

      return [];
    }

    const currentAccount = await this.getCurrentAccount();

    return (await this.getAllLoans())
      .filter(
        (l) =>
          !l.isPending() && l.getLender().address === currentAccount!.address,
      )
      .map((l) => l.asPersonalLoan());
  }

  async getLoanProposalAllowlist(): Promise<Identity[]> {
    const canRead = await this.canRead();
    if (!canRead) {
      console.debug(
        "Not yet in a state to read; returning an empty loan proposal allowlist",
      );

      return [];
    }

    return await this.readContract(
      undefined,
      "getLoanProposalAllowlist",
      undefined,
      async (account) => {
        return [account.address];
      },
      async (result) => {
        const resultArray = result as string[];
        return resultArray
          .filter((address) => {
            // exclude any empty elements from the array
            return !!parseInt(address, 16);
          })
          .map((address) => {
            return new Identity(address);
          });
      },
    );
  }

  async getPendingBorrowingLoans(): Promise<PendingLoan[]> {
    const canRead = await this.canRead();
    if (!canRead) {
      console.debug("Not yet in a state to read; returning an empty loan list");

      return [];
    }

    const currentAccount = await this.getCurrentAccount();

    return (await this.getAllLoans())
      .filter(
        (l) =>
          l.isPending() && l.getBorrower().address === currentAccount!.address,
      )
      .map((l) => l.asPendingLoan());
  }

  async getPendingLendingLoans(): Promise<PendingLoan[]> {
    const canRead = await this.canRead();
    if (!canRead) {
      console.debug("Not yet in a state to read; returning an empty loan list");

      return [];
    }

    const currentAccount = await this.getCurrentAccount();

    return (await this.getAllLoans())
      .filter(
        (l) =>
          l.isPending() && l.getLender().address === currentAccount!.address,
      )
      .map((l) => l.asPendingLoan());
  }

  async proposeLoan(
    borrowerAddress: string,
    amount: bigint,
    assetAddress: string,
  ): Promise<void> {
    await this.assertCanWrite();

    const loanID = await this.writeContract(
      undefined,
      "proposeLoan",
      undefined,
      async () => {
        return [borrowerAddress, assetAddress, amount];
      },
      async (result) => {
        return `${result}`;
      },
    );

    await this.waitForLoanExistence(loanID, true);
  }

  async proposeLoanImport(
    borrowerAddress: string,
    loanAmount: bigint,
    paidAmount: bigint,
    assetAddress: string,
  ): Promise<void> {
    await this.assertCanWrite();

    const loanID = await this.writeContract(
      undefined,
      "importLoan",
      undefined,
      async () => {
        return [borrowerAddress, assetAddress, loanAmount, paidAmount];
      },
      async (result) => {
        return `${result}`;
      },
    );

    await this.waitForLoanExistence(loanID, true);
  }

  rejectBorrow(loanID: string): Promise<void> {
    return this.cancelPendingLoan(loanID);
  }

  async repayLoan(loanID: string, amount: bigint): Promise<void> {
    await this.assertCanWrite();

    const allLoans = await this.getAllLoans();
    const matchingLoan = allLoans.find((l) => l.matchesLoanID(loanID));
    if (!matchingLoan) {
      throw new Error(`Cannot pay loan; loan with ID ${loanID} not found`);
    }

    const currentPaymentAmount = matchingLoan.getTotalAmountRepaid();

    await this.writeContract(
      undefined,
      "payLoan",
      undefined,
      async () => {
        return [BigInt(loanID), amount];
      },
      async () => {},
    );

    await this.waitForLoanState(loanID, (l) => {
      const paidAmount = l?.getTotalAmountRepaid() ?? BigInt(0);
      return paidAmount >= currentPaymentAmount + amount;
    });
  }

  // getAllLoans gets all loans to which the current user is associated.
  async getAllLoans(): Promise<OnchainPersonalLoan[]> {
    const canRead = await this.canRead();
    if (!canRead) {
      console.debug("Not yet in a state to read; returning an empty loan list");

      return [];
    }

    const currentChain = await this.getCurrentChain();
    const assetResolver = this.assetResolver;

    return await this.readContract(
      undefined,
      "getLoans",
      undefined,
      async (account) => {
        return [account.address];
      },
      async (results) => {
        const assetAddresses = (results as any[]).map((r) => r.loanedAsset);
        const assets = await Promise.all(
          [...new Set(assetAddresses)].map((a) =>
            assetResolver.getAsset(currentChain!.id, a),
          ),
        );

        const allLoans: OnchainPersonalLoan[] = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i] as any;
          const loanedAsset = assets.find(
            (a) => a?.address === result.loanedAsset,
          );
          if (!loanedAsset) {
            console.warn(
              `No asset found for loanedAsset ${results[i].loanedAsset}; its loan will not be shown here`,
            );

            continue;
          }

          allLoans.push(new OnchainPersonalLoan(result, loanedAsset));
        }

        return allLoans;
      },
    );
  }

  // getCurrentAccount returns the current account.
  // This is guaranteed to be defined if canRead or canWrite are satisfied.
  async getCurrentAccount(): Promise<Account | undefined> {
    if (!this.walletClient) {
      return undefined;
    }

    return this.walletClient?.account;
  }

  // getCurrentChain returns the current chain.
  // This is guaranteed to be defined if canRead or canWrite are satisfied.
  async getCurrentChain(): Promise<Chain | undefined> {
    if (!this.walletClient) {
      return undefined;
    }

    return this.walletClient.chain;
  }

  // readContract invokes a read action onchain.
  // If contractAddress is not supplied, then this is assumed to be a request
  // targeting this application's contract address.
  // If the ABI is not supplied, then the Ploan ABI will be used.
  async readContract<T>(
    contractAddress: string | undefined,
    functionName: string,
    abi: any | undefined,
    argsGenerator: (account: Account, chain: Chain) => Promise<any[]>,
    resultMapper: (result: any) => Promise<T>,
  ): Promise<T> {
    if (!this.publicClient) {
      throw new Error("Cannot read; public client is not set");
    }

    if (!this.walletClient) {
      throw new Error("Cannot read; wallet client is not set");
    }

    const walletAccount = await this.getCurrentAccount();
    if (!walletAccount) {
      throw new Error("Cannot read; wallet account is not set");
    }

    const currentChain = await this.getCurrentChain();
    if (!currentChain) {
      throw new Error("Cannot read; current chain is not set");
    }

    if (!contractAddress) {
      contractAddress = await this.resolveContractAddress();
    }
    const args = await argsGenerator(walletAccount, currentChain);

    const result = await this.publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: abi ?? ploanABI,
      functionName: functionName,
      args: args,
    });

    return await resultMapper(result);
  }

  // resolveContractAddress resolves the address of the contract to be used (if available).
  // This is guaranteed to be defined if canRead or canWrite are satisfied.
  async resolveContractAddress(): Promise<string | undefined> {
    const currentChain = await this.getCurrentChain();
    if (!currentChain) {
      return undefined;
    }

    return await this.contractResolver.resolveContractAddress(currentChain.id);
  }

  // setPublicClient sets the public client for the current chain.
  async setPublicClient(publicClient: PublicClient) {
    this.publicClient = publicClient;
  }

  // setWalletClient sets the wallet client for the current chain.
  async setWalletClient(walletClient: WalletClient) {
    this.walletClient = walletClient;
  }

  // waitForAllowlistModification generates a promise that resolves
  // when an event is received for the modification of the given participant
  // to the loan proposal allowlist of the given owner.
  async waitForAllowlistModification(
    participantAddress: string,
    allowed: boolean,
  ): Promise<void> {
    const pollResult = await poll(
      defaultPollFrequencyMillis,
      async () => {
        const foundParticipant = (await this.getLoanProposalAllowlist()).find(
          (participant) => {
            return (
              participant.address.toLowerCase() ===
              participantAddress.toLowerCase()
            );
          },
        );

        return (
          (allowed && !!foundParticipant) || (!allowed && !foundParticipant)
        );
      },
      defaultPollMaxTries,
    );

    if (!pollResult) {
      throw new Error("Timeout waiting for allowlist modification");
    }
  }

  // waitForLoanExistence waits for a loan to pass an existence or non-existence check.
  async waitForLoanExistence(loanID: string, exists: boolean) {
    await this.waitForLoanState(loanID, (loan) => (exists ? !!loan : !!loan));
  }

  async waitForLoanState(
    loanID: string,
    stateCheck: (loan: OnchainPersonalLoan | undefined) => boolean,
  ) {
    await poll(
      defaultPollFrequencyMillis,
      async () => {
        const allLoans = await this.getAllLoans();
        const matchingLoan = allLoans.find((l) => l.matchesLoanID(loanID));
        return stateCheck(matchingLoan);
      },
      defaultPollMaxTries,
    );
  }

  // writeContract invokes a write action onchain.
  // If contractAddress is not supplied, it will be assumed to be a request
  // targeted at this service's contract address.
  // If the ABI is not supplied, then the Ploan ABI will be used.
  async writeContract<T>(
    contractAddress: string | undefined,
    functionName: string,
    abi: any | undefined,
    argsGenerator: (account: Account, chain: Chain) => Promise<any[]>,
    resultMapper: (result: any) => Promise<T>,
  ): Promise<T> {
    if (!this.publicClient) {
      throw new Error("Cannot write; public client is not set");
    }

    if (!this.walletClient) {
      throw new Error("Cannot write; wallet client is not set");
    }

    const walletAccount = this.walletClient.account;
    if (!walletAccount) {
      throw new Error("Cannot write; wallet account is not set");
    }

    const currentChain = this.walletClient.chain;
    if (!currentChain) {
      throw new Error("Cannot write; current chain is not set");
    }

    if (!contractAddress) {
      contractAddress = await this.resolveContractAddress();
    }

    const args = await argsGenerator(walletAccount, currentChain);

    const { request, result } = await this.publicClient.simulateContract({
      account: walletAccount,
      address: contractAddress as `0x${string}`,
      abi: abi ?? ploanABI,
      functionName: functionName,
      args: args,
    });

    await this.walletClient.writeContract(request as any);

    return await resultMapper(result);
  }
}

class OnchainPersonalLoan {
  private loanID: number;

  private borrower: Identity;
  private lender: Identity;

  private loanedAsset: EthereumAsset;

  private totalAmountLoaned: bigint;
  private totalAmountRepaid: bigint;

  private completed: boolean;
  private imported: boolean;
  private started: boolean;
  private borrowerCommitted: boolean;
  private canceled: boolean;

  public constructor(personalLoanStruct: any, loanedAsset: EthereumAsset) {
    this.loanID = personalLoanStruct.loanId;

    this.borrower = new Identity(personalLoanStruct.borrower);
    this.lender = new Identity(personalLoanStruct.lender);

    this.loanedAsset = loanedAsset;

    this.totalAmountLoaned = personalLoanStruct.totalAmountLoaned;
    this.totalAmountRepaid = personalLoanStruct.totalAmountRepaid;

    this.completed = personalLoanStruct.completed;
    this.imported = personalLoanStruct.imported;
    this.started = personalLoanStruct.started;
    this.borrowerCommitted = personalLoanStruct.borrowerCommitted;
    this.canceled = personalLoanStruct.canceled;
  }

  // asPendingLoan returns the loan as a PendingLoan.
  public asPendingLoan(): PendingLoan {
    // sanity check
    if (!this.isPending()) {
      throw new Error(`Loan ${this.loanID} is not pending`);
    }

    let loanStatus = PendingLoanStatus.WAITING_FOR_ACCEPTANCE;
    if (this.borrowerCommitted) {
      loanStatus = PendingLoanStatus.ACCEPTED;
    }

    // EXECUTED can't actually be reached because this only works if started = false

    return new PendingLoan(
      this.loanID.toString(),
      this.lender,
      this.borrower,
      this.totalAmountLoaned,
      this.totalAmountRepaid,
      this.loanedAsset,
      loanStatus,
      this.imported,
    );
  }

  // asPersonalLoan returns the loan as a PersonalLoan
  public asPersonalLoan(): PersonalLoan {
    if (this.isPending()) {
      throw new Error(`Loan ${this.loanID} is pending`);
    }

    let loanStatus = LoanStatus.IN_PROGRESS;
    if (this.completed) {
      loanStatus = LoanStatus.COMPLETED;
    } else if (this.canceled) {
      loanStatus = LoanStatus.CANCELED;
    }

    return new PersonalLoan(
      this.loanID.toString(),
      this.borrower,
      this.lender,
      this.totalAmountLoaned,
      this.totalAmountRepaid,
      this.loanedAsset,
      loanStatus,
    );
  }

  // getBorrower returns the borrower of the loan
  public getBorrower(): Identity {
    return this.borrower;
  }

  // getLender returns the lender of the loan
  public getLender(): Identity {
    return this.lender;
  }

  // getTotalAmountLoaned returns the total amount paid back so far on the loan.
  public getTotalAmountRepaid(): bigint {
    return this.totalAmountRepaid;
  }

  // isAtLeastAccepted reflects if the pending loan has _at minimum_
  // progressed to a state of acceptance by the borrower.
  public isAtLeastAccepted(): boolean {
    return this.borrowerCommitted;
  }

  // isAtLeastExecuted indicates if this loan has, at minimum,
  // been executed by the lender.
  public isAtLeastExecuted(): boolean {
    return this.started;
  }

  // isCanceled indicates if the loan has, post-execution, been canceled.
  public isCanceled(): boolean {
    return this.canceled;
  }

  // isPending returns true if the loan is not yet started.
  public isPending(): boolean {
    return !this.started;
  }

  // matchesLoanID returns true if the loanID of this loan matches the given loanID.
  // This helps negotiate type differences of ID values.
  public matchesLoanID(loanID: string) {
    return this.loanID.toString() === loanID;
  }
}

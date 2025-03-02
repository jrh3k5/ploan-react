export const ploanABI = [
  { inputs: [], name: "InvalidInitialization", type: "error" },
  { inputs: [], name: "InvalidLoanAmount", type: "error" },
  { inputs: [], name: "InvalidLoanAsset", type: "error" },
  { inputs: [], name: "InvalidLoanRecipient", type: "error" },
  { inputs: [], name: "InvalidLoanState", type: "error" },
  { inputs: [], name: "InvalidPaymentAmount", type: "error" },
  {
    inputs: [{ internalType: "address", name: "lender", type: "address" }],
    name: "LenderNotAllowlisted",
    type: "error",
  },
  { inputs: [], name: "LoanAuthorizationFailure", type: "error" },
  { inputs: [], name: "NotInitializing", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "LoanAssociated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanCommitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "LoanDisassociated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "lender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountLoaned",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountAlreadyPaid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanImported",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LoanPaymentMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "allowlistOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "allowlistedAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "allowlisted",
        type: "bool",
      },
    ],
    name: "LoanProposalAllowlistModified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "lender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanProposed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "PendingLoanCanceled",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "toAllow", type: "address" }],
    name: "allowLoanProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "loanId", type: "uint256" }],
    name: "cancelLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "loanId", type: "uint256" }],
    name: "cancelPendingLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "loanId", type: "uint256" }],
    name: "commitToLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "toDisallow", type: "address" }],
    name: "disallowLoanProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "loanId", type: "uint256" }],
    name: "executeLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "listOwner", type: "address" }],
    name: "getLoanProposalAllowlist",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "participant", type: "address" }],
    name: "getLoans",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "loanId", type: "uint256" },
          {
            internalType: "uint256",
            name: "totalAmountLoaned",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalAmountRepaid",
            type: "uint256",
          },
          { internalType: "address", name: "borrower", type: "address" },
          { internalType: "address", name: "lender", type: "address" },
          { internalType: "address", name: "loanedAsset", type: "address" },
          { internalType: "bool", name: "borrowerCommitted", type: "bool" },
          { internalType: "bool", name: "canceled", type: "bool" },
          { internalType: "bool", name: "completed", type: "bool" },
          { internalType: "bool", name: "started", type: "bool" },
          { internalType: "bool", name: "repayable", type: "bool" },
          { internalType: "bool", name: "imported", type: "bool" },
        ],
        internalType: "struct PersonalLoan[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "borrower", type: "address" },
      { internalType: "address", name: "loanedAsset", type: "address" },
      { internalType: "uint256", name: "amountLoaned", type: "uint256" },
      { internalType: "uint256", name: "amountAlreadyPaid", type: "uint256" },
    ],
    name: "importLoan",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "loanId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "payLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "borrower", type: "address" },
      { internalType: "address", name: "loanedAsset", type: "address" },
      { internalType: "uint256", name: "amountLoaned", type: "uint256" },
    ],
    name: "proposeLoan",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

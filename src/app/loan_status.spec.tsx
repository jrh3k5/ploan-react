import { render } from "@testing-library/react";
import { LoanStatus } from "./loan_status";
import { EthereumAsset } from "@/models/asset";
import {
  PersonalLoan,
  LoanStatus as LoanStatusEnum,
} from "@/models/personal_loan";
import { Identity } from "@/models/identity";

describe("<LoanStatus />", () => {
  it("renders an in-progress loan", () => {
    const personaLoan = new PersonalLoan(
      "1",
      new Identity("0x1"),
      new Identity("0x2"),
      1n,
      0n,
      new EthereumAsset(1, "ETH", 18, undefined),
      LoanStatusEnum.IN_PROGRESS,
    );

    const { container } = render(<LoanStatus loan={personaLoan} />);
    expect(container.textContent).toBe("In Progress");
  });

  it("renders an completed loan", () => {
    const personaLoan = new PersonalLoan(
      "1",
      new Identity("0x1"),
      new Identity("0x2"),
      1n,
      0n,
      new EthereumAsset(1, "ETH", 18, undefined),
      LoanStatusEnum.COMPLETED,
    );

    const { container } = render(<LoanStatus loan={personaLoan} />);
    expect(container.textContent).toBe("Completed");
  });

  it("renders an canceled loan", () => {
    const personaLoan = new PersonalLoan(
      "1",
      new Identity("0x1"),
      new Identity("0x2"),
      1n,
      0n,
      new EthereumAsset(1, "ETH", 18, undefined),
      LoanStatusEnum.CANCELED,
    );

    const { container } = render(<LoanStatus loan={personaLoan} />);
    expect(container.textContent).toBe("Canceled");
  });

  it("renders an unspecifieds loan", () => {
    const personaLoan = new PersonalLoan(
      "1",
      new Identity("0x1"),
      new Identity("0x2"),
      1n,
      0n,
      new EthereumAsset(1, "ETH", 18, undefined),
      LoanStatusEnum.UNSPECIFIED,
    );

    const { container } = render(<LoanStatus loan={personaLoan} />);
    expect(container.textContent).toBe("Unspecified");
  });
});

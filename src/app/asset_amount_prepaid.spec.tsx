import React from "react";
import { render, screen } from "@testing-library/react";
import { AssetAmountPrepaid } from "./asset_amount_prepaid";
import { EthereumAsset } from "@/models/asset";

// Minimal mock for EthereumAsset
function defaultAsset(): EthereumAsset {
  return new EthereumAsset(
    1,
    "ETH",
    18,
    "0x0000000000000000000000000000000000000000",
  );
}

describe("AssetAmountPrepaid", () => {
  it("renders with given asset and amount", () => {
    const asset = defaultAsset();
    const amount = 1000000000000000000n; // 1 ETH in wei
    render(<AssetAmountPrepaid asset={asset} amount={amount} />);
    // Should render the formatted amount and 'prepaid' text
    expect(screen.getByText(/prepaid/i)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/ETH/)).toBeInTheDocument();
  });

  it("renders with a different asset and amount", () => {
    const asset = new EthereumAsset(
      1,
      "DAI",
      18,
      "0x0000000000000000000000000000000000000001",
    );
    const amount = 5000000000000000000n; // 5 DAI
    render(<AssetAmountPrepaid asset={asset} amount={amount} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/DAI/)).toBeInTheDocument();
    expect(screen.getByText(/prepaid/i)).toBeInTheDocument();
  });
});

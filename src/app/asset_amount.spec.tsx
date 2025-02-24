import { render } from "@testing-library/react";
import { AssetAmount } from "./asset_amount";
import { EthereumAsset } from "@/models/asset";

describe("<AssetAmount />", () => {
  it("renders out the asset data", () => {
    const amount = 10n * 10n ** 18n + 1n * 10n ** 16n;
    const ethereumAsset = new EthereumAsset(1, "ETH", 18, "0x");

    const { container } = render(
      <AssetAmount amount={amount} asset={ethereumAsset} />,
    );

    // Do a partial search because the breaking up of the asset data
    // from the amount can cause this lookup to fail.
    const spanNodes = container.querySelectorAll("span");
    expect(spanNodes).toHaveLength(2);
    expect(spanNodes[0].textContent).toBe("10.01 ETH");
  });
});

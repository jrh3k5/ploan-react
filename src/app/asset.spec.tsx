import { render } from "@testing-library/react";
import { Asset } from "./asset";
import { EthereumAsset } from "@/models/asset";

describe("<Asset />", () => {
  it("renders out the asset data", () => {
    const ethereumAsset = new EthereumAsset(1, "ETH", 18, "0x");

    const { container } = render(<Asset asset={ethereumAsset} />);

    const spanNodes = container.querySelectorAll("span");
    expect(spanNodes).toHaveLength(1);
    expect(spanNodes[0].textContent).toBe("ETH");
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { WelcomePage } from "./welcome_page";

// Mock the default ConnectWallet for testing default behavior
jest.mock("./connect_wallet", () => ({
  ConnectWallet: () => (
    <div data-testid="default-connect-wallet">Default ConnectWallet</div>
  ),
}));

describe("WelcomePage", () => {
  it("renders the default ConnectWallet", () => {
    render(<WelcomePage />);
    expect(screen.getByTestId("default-connect-wallet")).toBeInTheDocument();
  });
});

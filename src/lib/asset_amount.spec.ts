import { calculateTokenAmount, formatAssetAmount } from "./asset_amount";

describe("formatTokenAmount", () => {
  it("should format a whole token amount", () => {
    expect(formatAssetAmount(10n * 10n ** 18n, 18)).toBe("10");
  });

  describe("the token amount has fractional values", () => {
    describe("the fractional amount fits within a two-decimal place", () => {
      it("formats the amount without an ellipsis", () => {
        expect(formatAssetAmount(10n * 10n ** 18n + 1n * 10n ** 16n, 18)).toBe(
          "10.01",
        );
        expect(formatAssetAmount(10n * 10n ** 18n + 2n * 10n ** 17n, 18)).toBe(
          "10.20",
        );
      });
    });

    describe("the fractional amount does not fit within a two-decimal place", () => {
      describe("the fractional amount has leading zeroes", () => {
        it("formats the amount with an ellipsis to indicate precision rounding", () => {
          expect(
            formatAssetAmount(10n * 10n ** 18n + 35n * 10n ** 15n, 18),
          ).toBe("10.03...");
          expect(
            formatAssetAmount(10n * 10n ** 18n + 245n * 10n ** 15n, 18),
          ).toBe("10.24...");
        });
      });
    });

    describe("the amount has no whole tokens", () => {
      it("formats the value with a leading zero", () => {
        expect(formatAssetAmount(1n * 10n ** 16n, 18)).toBe("0.01");
      });

      describe("the value has a precision of greater than two decimal places", () => {
        it("formats the value with an ellipsis", () => {
          expect(formatAssetAmount(1n * 10n ** 16n, 20)).toBe("0.00...");
        });
      });
    });
  });
});

describe("calculateTokenAmount", () => {
  describe("the token is a whole, integer amount", () => {
    it("returns the token amount as a bigint", () => {
      expect(calculateTokenAmount("10", 18)).toBe(10n * 10n ** 18n);
    });
  });

  describe("the token is a fractional amount", () => {
    it("returns the token amount as a bigint", () => {
      expect(calculateTokenAmount("10.01", 18)).toBe(
        10n * 10n ** 18n + 1n * 10n ** 16n,
      );
    });

    describe("there is a trailing zero", () => {
      it("correctly parses the token amount", () => {
        expect(calculateTokenAmount("10.10", 18)).toBe(
          10n * 10n ** 18n + 1n * 10n ** 17n,
        );
      });
    });

    describe("there are no whole tokens", () => {
      it("returns the token amount as a bigint", () => {
        expect(calculateTokenAmount("0.01", 18)).toBe(1n * 10n ** 16n);
      });

      describe("there are no zeroes for the missing whole token", () => {
        it("returns the token amount as a bigint", () => {
          expect(calculateTokenAmount(".12", 18)).toBe(12n * 10n ** 16n);
        });

        describe("there are leading zeroes", () => {
          it("returns the token amount as a bigint", () => {
            expect(calculateTokenAmount(".01", 18)).toBe(1n * 10n ** 16n);
          });
        });
      });
    });
  });
});

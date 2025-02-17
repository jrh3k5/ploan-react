// formatAssetAmount formats the given bigint of tokens into a decimal value
export function formatAssetAmount(tokenAmount: bigint, decimals: number): string {
  const wholeTokens = tokenAmount / BigInt(10 ** decimals);
  const remainingFractionals =
    tokenAmount - wholeTokens * BigInt(10 ** decimals);
  if (remainingFractionals === 0n) {
    return wholeTokens.toString();
  }

  // Round the fractionals to two decimals place, if possible
  if (decimals - 1 - remainingFractionals.toString().length > 2) {
    // Add a 00 to indicate a precision rounding
    return wholeTokens.toString() + ".00...";
  }

  const neededLeadingZeroes = decimals - remainingFractionals.toString().length;
  let leadingZeroes = "";
  if (neededLeadingZeroes > 0) {
    leadingZeroes = "0".repeat(neededLeadingZeroes);
  }

  return (
    wholeTokens.toString() +
    "." +
    leadingZeroes +
    remainingFractionals.toString().substring(0, 2 - neededLeadingZeroes)
  );
}

// calculateTokenAmount will parse the given token amount and into a bigint representation of the token amount
// for the given decimals
export function calculateTokenAmount(formattedTokenAmount: string, decimals: number): bigint {
    return 0n;
}

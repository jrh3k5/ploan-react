// formatAssetAmount formats the given bigint of tokens into a decimal value
export function formatAssetAmount(
  tokenAmount: bigint,
  decimals: number,
): string {
  const wholeTokens = tokenAmount / BigInt(10 ** decimals);
  const remainingFractionals =
    tokenAmount - wholeTokens * BigInt(10 ** decimals);
  if (remainingFractionals === 0n) {
    return wholeTokens.toString();
  }

  let fractionalsString = remainingFractionals.toString();
  const neededLeadingZeroes = decimals - fractionalsString.length;
  if (neededLeadingZeroes > 0) {
    fractionalsString = "0".repeat(neededLeadingZeroes) + fractionalsString;
  }

  // Format the string with a maximum of 2 decimal places
  // Add an ellipsis to indicate precision rounding
  // Start by stripping off trailing zeroes
  while (fractionalsString.endsWith("0")) {
    fractionalsString = fractionalsString.substring(
      0,
      fractionalsString.length - 1,
    );
  }

  let roundingEllipsis = "";
  if (fractionalsString.length > 2) {
    roundingEllipsis = "...";
  } else {
    // Add a trailing 0 if needed
    while (fractionalsString.length < 2) {
      fractionalsString += "0";
    }
  }

  return (
    wholeTokens.toString() +
    "." +
    fractionalsString.substring(0, 2) +
    roundingEllipsis
  );
}

// calculateTokenAmount will parse the given token amount and into a bigint representation of the token amount
// for the given decimals
export function calculateTokenAmount(
  formattedTokenAmount: string,
  decimals: number,
): bigint {
  const splitAmount = formattedTokenAmount.split(".");
  let wholeAmount: bigint;
  if (splitAmount.length == 1) {
    wholeAmount = BigInt(splitAmount[0]) * BigInt(10 ** decimals);
  } else {
    const partialTokenAmount = splitAmount[1];

    let wholeTokens = BigInt(0);
    if (splitAmount[0] !== "") {
      wholeTokens = BigInt(splitAmount[0]) * BigInt(10 ** decimals);
    }

    const partialTokenScale = BigInt(
      10 ** (decimals - partialTokenAmount.length),
    );
    wholeAmount = wholeTokens + BigInt(partialTokenAmount) * partialTokenScale;
  }

  return wholeAmount;
}

export async function poll(
  intervalMillis: number,
  evaluation: () => Promise<Boolean>,
  maxTries: number,
): Promise<Boolean> {
  return tryEvaluation(intervalMillis, evaluation, 0, maxTries);
}

async function tryEvaluation(
  intervalMillis: number,
  evaluation: () => Promise<Boolean>,
  tryCount: number,
  maxTries: number,
): Promise<Boolean> {
  if (tryCount >= maxTries) {
    return false;
  }
  if (await evaluation()) {
    return true;
  }

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          tryEvaluation(intervalMillis, evaluation, tryCount + 1, maxTries),
        ),
      intervalMillis,
    ),
  );
}

import { InMemoryErrorReporter } from "./error_reporter";

describe("InMemoryErrorReporter", () => {
  let capturedErrors: Error[];
  let reporter: InMemoryErrorReporter;

  beforeEach(async () => {
    reporter = new InMemoryErrorReporter();
    capturedErrors = [];

    await reporter.registerErrorListener(async (error: Error) => {
      capturedErrors.push(error);
    });
  });

  describe("reportAny", () => {
    it("reports instances of Error", async () => {
      const errorMessage = "test reportAny -> Error";
      await reporter.reportAny(new Error(errorMessage));

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe(errorMessage);
    });

    it("reports instances of string", async () => {
      const errorMessage = "test reportAny -> string";
      await reporter.reportAny(errorMessage);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe(errorMessage);
    });

    it("handles any other instance", async () => {
      const errorValue = 1;
      await reporter.reportAny(errorValue);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe(`Unknown error: ${errorValue}`);
    });
  });

  describe("reportError", () => {
    it("reports the error to the listeners", async () => {
      const errorMessage = "test reportError";
      await reporter.reportError(new Error(errorMessage));

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe(errorMessage);
    });
  });

  describe("reportErrorMessage", () => {
    it("reports the error to the listeners", async () => {
      const errorMessage = "test reportErrorMessage";
      await reporter.reportErrorMessage(errorMessage);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe(errorMessage);
    });
  });
});

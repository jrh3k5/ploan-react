const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/models/(.*)$": "<rootDir>/src/models/$1",
    "^@/services/(.*)$": "<rootDir>/src/services/$1",
  },
  // Allow all node_modules to be transformed (to support ESM dependencies)
  transformIgnorePatterns: ["/node_modules/(?!.*)"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);

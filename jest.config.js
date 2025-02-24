/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/models/(.*)$": "<rootDir>/src/models/$1",
    "^@/services/(.*)$": "<rootDir>/src/services/$1",
  },
};

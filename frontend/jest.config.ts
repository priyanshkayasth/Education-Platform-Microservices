import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },

  testMatch: [
    "**/__tests__/**/*.(ts|tsx)",
    "**/?(*.)+(spec|test).(ts|tsx)",
  ],
};

export default config;

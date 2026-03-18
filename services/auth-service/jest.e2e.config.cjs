module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
  },
  // setupFiles: ['./src/tests/setup.e2e.ts'],
    setupFiles: ['./src/tests/setupE2E.ts'],  // ← updated name

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/*.e2e.ts'],  // ← only picks up e2e test files
};
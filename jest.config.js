module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/assets/typescript/$1',
    '^@/types/(.*)$': '<rootDir>/assets/typescript/types/$1',
    '^@/components/(.*)$': '<rootDir>/assets/typescript/components/$1',
    '^@/services/(.*)$': '<rootDir>/assets/typescript/services/$1',
    '^@/utils/(.*)$': '<rootDir>/assets/typescript/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/assets/typescript/hooks/$1'
  },
  collectCoverageFrom: [
    'assets/typescript/**/*.{ts,tsx}',
    '!assets/typescript/**/*.d.ts',
    '!assets/typescript/**/*.test.{ts,tsx}',
    '!assets/typescript/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/assets/typescript/**/*.test.{ts,tsx}'
  ]
};
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^socket.io-client$': '<rootDir>/__mocks__/socket.io-client.cjs',
  }
};
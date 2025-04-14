module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
    testMatch: ['**/src/components/**/*.test.js'],
    moduleNameMapper: {
      '^react-router-dom$': '<rootDir>/__mocks__/react-router-dom.js'
    }
  };
  
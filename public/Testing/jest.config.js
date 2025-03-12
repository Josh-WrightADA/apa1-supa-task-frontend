module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: ['**/*.test.js'],
    moduleDirectories: ['node_modules', 'public'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': '<rootDir>/public/Testing/__mocks__/styleMock.js',
    }
  };
  
  
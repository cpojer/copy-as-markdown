module.exports = {
  moduleNameMapper: {'(index).js': '<rootDir>/$1.tsx'},
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(test).tsx'],
};

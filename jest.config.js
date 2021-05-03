module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/?(*.)+(test).tsx'],
  moduleNameMapper: {'(index).js': '<rootDir>/$1.tsx'},
};

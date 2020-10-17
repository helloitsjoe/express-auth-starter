module.exports = {
  preset: '@shelf/jest-mongodb',
  watchPathIgnorePatterns: ['globalConfig'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};

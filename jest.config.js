module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-native-community|@react-navigation)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};

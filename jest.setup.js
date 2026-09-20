/* eslint-disable no-undef */
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      setItem: jest.fn((key, value) => {
        store.set(key, value);
        return Promise.resolve(null);
      }),
      getItem: jest.fn((key) => {
        return Promise.resolve(store.has(key) ? store.get(key) : null);
      }),
      removeItem: jest.fn((key) => {
        store.delete(key);
        return Promise.resolve(null);
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve(null);
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Array.from(store.keys()))),
    },
  };
});

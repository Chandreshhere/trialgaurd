/* eslint-disable @typescript-eslint/no-require-imports */
require('react-native-gesture-handler/jestSetup');

// Deterministic clock for every date and reminder test.
process.env.TZ = 'America/New_York';

// AsyncStorage is a native module; the package ships an in-memory stand-in.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-crypto is native too. Node's own UUID generator is a faithful substitute
// for the one property the app relies on: that ids are unique.
jest.mock('expo-crypto', () => ({
  randomUUID: () => require('node:crypto').randomUUID(),
}));

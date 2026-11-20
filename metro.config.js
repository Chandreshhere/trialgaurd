// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * This project lives on an exFAT volume, where macOS stores extended attributes
 * in AppleDouble sidecar files named `._<original>`. Metro's crawler and
 * expo-router's route scan otherwise pick `.__layout.tsx` up as real source and
 * fail to parse its binary contents. Block them at the resolver.
 */
config.resolver.blockList = [/(^|[\\/])\._[^\\/]*$/];

module.exports = config;

import type { ExpoConfig } from 'expo/config'

/**
 * Dynamic config so the web export can be hosted under a sub-path without
 * affecting native builds or local development.
 *
 * EXPO_BASE_URL is set only by the GitHub Pages export (see package.json →
 * export:pages); it stays empty for `expo start`.
 */
const baseUrl = process.env.EXPO_BASE_URL ?? ''

const config: ExpoConfig = {
  name: 'Fitraa',
  slug: 'fitraa',
  version: '1.0.0',
  scheme: 'fitraa',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#08090C',
  // New Architecture is the default in SDK 57, so it needs no flag here.
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.fitraa.app',
  },
  android: {
    package: 'com.fitraa.app',
    adaptiveIcon: {
      backgroundColor: '#08090C',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    // Splash configuration moved out of the top-level config in SDK 57.
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#08090C',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    ...(baseUrl ? { baseUrl } : {}),
  },
}

export default config

# React Native AI Chat - Powered by ChatGPT API

Android based AI chat application. Built using useLLM react hook and ChatGPT API.

_Note: This app has only been tested on Android. It might required some changes for it to work on iOS._

## Android Development Environment

Follow the [instructions](https://reactnative.dev/docs/environment-setup?os=macos&platform=android) here for your Development OS with Android target.

A few things you would want to install:

- Node
- Watchman (macOS)
- JDK
- Android Studio
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device

Make sure that you have followed the installation instructions. You should have these environment variables set up:

- JAVA_HOME
- ANDROID_HOME

## Development

Install dependencies:

```
npm install
```

Run the metro server:

```
npm run start
```

Select "a - run on Android" when prompted. After the build finishes, you will see the running app on your emulator/device.

## Build APK

By default, it uses debug key to build the APK, which should be fine for development. If you wish to publish the app on Play Store, follow the instructions [here](https://reactnative.dev/docs/signed-apk-android) for setting the release key.

Creating a release build:

```
npm run release
```

Release apk will be located at `android/app/build/outputs/apk/release/app-release.apk`.

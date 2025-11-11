# Today's Dental Insights - React Native App

## Setup

### 1. Install Dependencies

```bash
npm install
# or 
yarn
```

### 2. Set Up Native Modules

#### Vector Icons

React Native Vector Icons requires additional setup in your native projects. See [VECTOR_ICONS_SETUP.md](./VECTOR_ICONS_SETUP.md) for detailed instructions.

#### Chime SDK Native Bridge

The call center functionality requires setting up the Amazon Chime SDK native bridge. See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed instructions.

### 3. Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

- `login/` - Authentication components and services
- `call-center/` - Voice call components using Amazon Chime SDK
- `shared/` - Shared components and utilities
- `navigation/` - React Navigation configuration
- `types/` - TypeScript type definitions

## Troubleshooting

### TypeScript errors with react-native-vector-icons

If you're seeing TypeScript errors with react-native-vector-icons, make sure you've:

1. Installed the package: `npm install react-native-vector-icons --save`
2. Added the type declarations in `types/react-native-vector-icons.d.ts`
3. Updated your tsconfig.json to include the types directory:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  }
}
```

### Audio issues on iOS

If you're experiencing audio issues on iOS:

1. Make sure you've set up the proper permissions in Info.plist
2. Call the `unlockAudio()` function when answering calls
3. Check that the AudioSession is properly configured

### Native module linking issues

If you're having issues with native module linking:

1. For iOS, run `pod install` in the ios directory
2. For Android, ensure you've properly updated your build.gradle files
3. Clean and rebuild the project:

```bash
# iOS
cd ios && rm -rf build && pod install && cd ..
npm run ios

# Android
cd android && ./gradlew clean && cd ..
npm run android
```
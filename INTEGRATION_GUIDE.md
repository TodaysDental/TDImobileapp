# Today's Dental Insights - React Native Integration Guide

This guide provides instructions for integrating the TDS components into your React Native application.

## Overview

The TDS React Native implementation includes two main modules:

1. **Login Module**: Authentication components for OTP login
2. **Call Center Module**: Voice call components using Amazon Chime SDK

## Prerequisites

- React Native 0.65+
- Node.js 14+
- iOS 13+ for iOS deployment
- Android API level 26+ for Android deployment

## Installation

### 1. Install required dependencies

```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install @tanstack/react-query jotai zod axios
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons

# For iOS
cd ios && pod install
```

### 2. Configure permissions

#### iOS (Info.plist)

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for calls</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>voip</string>
</array>
```

#### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.BLUETOOTH" />
```

## Module Integration

### Login Module

1. Import the `Login` component:

```jsx
import { Login } from './login/components/Login';

// Use in your navigation stack
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
```

2. Configure the login URL in `login/services/api.service.ts`

### Call Center Module

1. Wrap your app with the CallCenterProvider:

```jsx
import { CallCenterProvider } from './call-center/context/CallCenterProvider';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <CallCenterProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CallCenterProvider>
      </Provider>
    </QueryClientProvider>
  );
}
```

2. Use the components in your screens:

```jsx
import { StatusControls, Softphone } from './call-center/components';

function CallCenterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>Call Center</Text>
        <StatusControls />
      </View>
      
      <Softphone />
    </View>
  );
}
```

## Native Module Implementation

The call center functionality requires a native bridge to the Amazon Chime SDK. Follow these steps to complete the native module integration:

### iOS Setup

1. Install the Amazon Chime SDK in your iOS project.
2. Copy the native module implementation files:
   - `D:\zswaraj\TDS\call-center\native\ios\ChimeSDKModule.m`
   - `D:\zswaraj\TDS\call-center\native\ios\ChimeSDKModule.swift`
3. Update your Podfile to include the Amazon Chime SDK and add the module to the project.

### Android Setup

1. Install the Amazon Chime SDK in your Android project.
2. Copy the native module implementation files:
   - `D:\zswaraj\TDS\call-center\native\android\ChimeSDKModule.java`
   - `D:\zswaraj\TDS\call-center\native\android\ChimeSDKPackage.java`
3. Register the module in your MainApplication.java file.

## Testing

1. Test the login flow first:
   - Verify OTP request and submission
   - Check token storage in AsyncStorage

2. Test the call center functionality:
   - Go online as an agent
   - Make outbound calls
   - Receive incoming calls
   - Test call controls (mute, hangup, etc.)
   - Test audio device selection

## Common Issues

1. **Audio permissions**: Ensure your app has the necessary permissions for microphone access.

2. **Missing native modules**: If you see errors about missing ChimeSDKModule, verify that the native modules are properly linked.

3. **Token storage**: Make sure the tokens from login are correctly stored and accessible to the call center module.

## Support

For issues or questions, contact the Today's Dental Insights support team.

# React Native Call Center Module for Today's Dental Insights

This module provides a complete React Native implementation for handling voice calls using Amazon Chime SDK.

## Features

- Agent presence management (online/offline status)
- Incoming and outbound calls
- Call control (accept, reject, hang up)
- Call transfer
- Audio device selection
- Mute/unmute functionality
- Clinic selection for agents

## Prerequisites

Before using this module, ensure you have the following dependencies installed in your React Native project:

```bash
# Core dependencies
npm install @tanstack/react-query jotai axios @react-native-async-storage/async-storage

# UI dependencies
npm install react-native-vector-icons

# If you don't have React Navigation yet
npm install @react-navigation/native @react-navigation/native-stack

# Native module required permissions
# (these will be handled automatically during pod install)
```

## Native Module Setup

### iOS Setup

1. Add the Amazon Chime SDK to your Podfile:

```ruby
target 'YourAppName' do
  # ...existing pods
  
  # Amazon Chime SDK
  pod 'AmazonChimeSDK', '~> 0.22.0'
end
```

2. Run pod install:

```bash
cd ios && pod install
```

3. Update your Info.plist to include required permissions:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for calls</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>voip</string>
</array>
```

### Android Setup

1. Add the Amazon Chime SDK to your app/build.gradle:

```gradle
dependencies {
    // ...existing dependencies
    
    // Amazon Chime SDK
    implementation 'com.amazonaws:amazon-chime-sdk:0.22.0'
    implementation 'com.amazonaws:amazon-chime-sdk-media:0.22.0'
}
```

2. Update your AndroidManifest.xml to include required permissions:

```xml
<manifest>
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    
    <!-- ...rest of manifest -->
</manifest>
```

## Usage

### 1. Wrap your application with the CallCenterProvider

```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { CallCenterProvider } from './call-center/context/CallCenterProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import AppNavigator from './navigation'; // Your app navigation

const queryClient = new QueryClient();

const App = () => {
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
};

export default App;
```

### 2. Use the StatusControls component in your UI

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusControls } from './call-center/components/StatusControls';

const HeaderComponent = () => {
  return (
    <View style={styles.header}>
      <StatusControls />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
});

export default HeaderComponent;
```

### 3. Create a screen to make outbound calls using the Dialpad

```jsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Dialpad } from './call-center/components/Dialpad';
import { useCallCenter } from './call-center/context/CallCenterProvider';

const OutboundCallScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { makeOutboundCall, availableClinics, agentStatus } = useCallCenter();
  
  const handleMakeCall = () => {
    if (availableClinics.length > 0 && phoneNumber) {
      // Use the first clinic as the caller ID for simplicity
      makeOutboundCall(phoneNumber, availableClinics[0].clinicId);
    }
  };
  
  const isOnline = agentStatus === 'Online';

  return (
    <View style={styles.container}>
      <Dialpad onNumberChange={setPhoneNumber} currentNumber={phoneNumber} />
      
      <TouchableOpacity 
        style={[styles.callButton, !isOnline && styles.disabledButton]}
        onPress={handleMakeCall}
        disabled={!isOnline || !phoneNumber}
      >
        <Text style={styles.callButtonText}>Call</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  callButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  callButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OutboundCallScreen;
```

### 4. Handle incoming calls

The CallCenterProvider automatically handles incoming calls and displays an alert when a call is received. You can customize this behavior by creating your own UI for incoming calls:

```jsx
import React, { useEffect } from 'react';
import { useCallCenter } from './call-center/context/CallCenterProvider';
import IncomingCallScreen from './screens/IncomingCallScreen'; // Your custom UI

const CallHandler = () => {
  const { incomingCall, acceptCall, rejectCall } = useCallCenter();
  
  // Show your custom UI when there's an incoming call
  if (incomingCall) {
    return (
      <IncomingCallScreen
        callerNumber={incomingCall.from}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    );
  }
  
  return null; // Don't render anything when there's no incoming call
};

// Add this component at the top level of your app
```

## API Reference

### CallCenterProvider

The main context provider for all call center functionality.

### Components

- **StatusControls**: UI component for managing agent status
- **Dialpad**: UI component for entering phone numbers
- **InCallControls**: UI component for in-call actions (mute, hang up, etc.)

### Hooks

- **useCallCenter()**: Main hook to access all call center functionality

## Troubleshooting

### Common Issues

1. **Audio issues on iOS**: Make sure to call `unlockAudio()` when answering a call or after a call connects.
2. **Permissions errors**: Ensure you've added all required permissions to your app.
3. **Connection errors**: Check your network connection and AWS credentials.

## License

This module is proprietary software owned by Today's Dental Insights.

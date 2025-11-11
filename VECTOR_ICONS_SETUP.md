# React Native Vector Icons Setup

This guide provides instructions for setting up React Native Vector Icons in your iOS and Android projects.

## iOS Setup

1. **Link the font files**

   You need to link the font files to your iOS project. This can be done in two ways:

   ### Option 1: Using Cocoapods (Recommended)

   Add the following to your `Podfile`:

   ```ruby
   pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
   ```

   Then run:

   ```bash
   cd ios && pod install
   ```

   ### Option 2: Manual Linking

   Copy the font files you need to your iOS project:

   ```bash
   cp ./node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf ./ios/YourProject/Fonts/
   ```

2. **Update Info.plist**

   Add the fonts to your `Info.plist`:

   ```xml
   <key>UIAppFonts</key>
   <array>
     <string>MaterialIcons.ttf</string>
   </array>
   ```

## Android Setup

1. **Create the assets directory** (if it doesn't exist)

   ```bash
   mkdir -p android/app/src/main/assets/fonts
   ```

2. **Copy the font files**

   ```bash
   cp ./node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf ./android/app/src/main/assets/fonts/
   ```

3. **Update build.gradle**

   In your `android/app/build.gradle` file, add:

   ```gradle
   apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
   ```

## Testing the Setup

To test that the Vector Icons are working correctly, try using the following component:

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function IconTest() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="phone" size={40} color="green" />
      <Text>Phone Icon</Text>
    </View>
  );
}
```

If you can see the phone icon, the setup was successful.

## Troubleshooting

- **Icons not showing on Android**: Make sure you've copied the font files to the correct location and added the fonts.gradle file.
- **Icons not showing on iOS**: Ensure the fonts are properly linked and listed in Info.plist.
- **Crash on iOS**: If the app crashes when using icons, check that the font files are properly copied and linked.

For more detailed instructions, refer to the [official documentation](https://github.com/oblador/react-native-vector-icons).

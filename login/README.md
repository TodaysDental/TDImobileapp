# React Native Login Module

This module provides a complete React Native implementation for handling user authentication via email OTP (One-Time Password).

## Features

- Email-based OTP authentication
- Form validation
- Secure token storage
- React Query integration for API calls
- Jotai for state management

## Dependencies

This module requires the following dependencies to be installed in your React Native project:

```bash
npm install @tanstack/react-query jotai zod axios @react-native-async-storage/async-storage
```

## Usage

1. Import the Login component in your navigation:

```typescript
import { Login } from './login/components/Login';

// In your navigation
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      {/* Other screens */}
    </Stack.Navigator>
  );
}
```

2. Make sure to set up the React Query provider in your app's entry point:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        {/* Your app navigation */}
      </NavigationContainer>
    </QueryClientProvider>
  );
}
```

3. Update the API base URL in `services/api.service.ts` to point to your authentication endpoint.

## Notes for Conversion from Web to React Native

1. The web version's local storage has been replaced with AsyncStorage
2. React Bootstrap components have been replaced with React Native components
3. Navigation uses React Navigation instead of react-router-dom
4. Toast notifications use Alert API instead of react-toastify
5. JWT token parsing uses Buffer from the buffer package for Base64 decoding

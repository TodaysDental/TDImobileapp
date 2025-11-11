# Shared Components and Utilities for React Native

This directory contains shared components, utilities, and constants that can be used across the Today's Dental Insights React Native application.

## Contents

### Components

- **NavHeader**: A navigation header component with user menu, status controls, and navigation capabilities.

### Utilities

- **http.ts**: HTTP client creation utility with authentication token handling and error handling.
- **constants.ts**: Application-wide constants including API URLs, endpoints, and configuration settings.

## Usage

### NavHeader

```jsx
import { NavHeader } from '../shared';

function MyScreen() {
  return (
    <View style={styles.container}>
      <NavHeader />
      {/* Rest of your screen content */}
    </View>
  );
}
```

### HTTP Client

```jsx
import { createHttpClient } from '../shared';

const apiClient = createHttpClient({
  baseURL: 'https://api.example.com',
});

// Make API requests
async function fetchData() {
  try {
    const { data } = await apiClient.get('/endpoint');
    return data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

### Constants

```jsx
import { API_BASE_URL, APP_CONFIG } from '../shared';

console.log('API Base URL:', API_BASE_URL);
console.log('App name:', APP_CONFIG.APP_NAME);
```

## Dependencies

The shared components and utilities depend on:

- react-navigation (for navigation)
- axios (for HTTP requests)
- react-native-svg (for icons in NavHeader)
- @react-native-async-storage/async-storage (for token storage)
- jotai (for state management)

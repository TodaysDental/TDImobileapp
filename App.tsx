import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import { CallCenterProvider } from './call-center/context/CallCenterProvider';
import Navigation from './navigation';
import { IncomingCallToast } from './call-center/components';

// Ignore specific harmless warnings (optional)
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <CallCenterProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Navigation />
          <IncomingCallToast />
        </CallCenterProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;
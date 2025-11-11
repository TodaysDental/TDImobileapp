import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Login } from '../login/components/Login';
import { CallCenterScreen } from '../call-center/examples';

// Import other screens here
// import Dashboard from '../screens/Dashboard';

// Define your navigation types
type RootStackParamList = {
  Login: undefined;
  CallCenter: undefined;
  Dashboard: undefined;
  // Add other screens here
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('idToken');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // You could return a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          // Auth screens
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ 
              headerShown: false,
              // Prevent going back to splash screen
              gestureEnabled: false
            }} 
          />
        ) : (
          // App screens
          <>
            <Stack.Screen 
              name="CallCenter" 
              component={CallCenterScreen}
              options={{ 
                title: 'Call Center',
                headerShown: false 
              }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardPlaceholder}
              options={{ title: 'Dashboard' }}
            />
            {/* Add other screens here */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder component - replace with your actual Dashboard
const DashboardPlaceholder = () => {
  return null;
};

export default Navigation;

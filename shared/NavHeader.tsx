import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSetAtom } from 'jotai';
import { authTokenAtom } from '../login/store/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Svg, Path } from 'react-native-svg';

// Placeholder for StatusControls component
// In a real implementation, you would import the actual component
const StatusControls = () => {
  return (
    <TouchableOpacity style={styles.statusButton}>
      <Text style={styles.statusText}>Available</Text>
    </TouchableOpacity>
  );
};

export const NavHeader: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const setAuthToken = useSetAtom(authTokenAtom);

  const handleLogout = async () => {
    try {
      // Clear all tokens
      setAuthToken(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('idToken');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      
      // Show logout success message
      Alert.alert('Success', 'Logged out successfully');
      
      // Navigate to login screen
      // Reset navigation stack to prevent going back
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
    
    // Close the dropdown menu
    setMenuVisible(false);
  };

  const navigateTo = (screen: string) => {
    navigation.navigate(screen);
    setMenuVisible(false);
  };

  return (
    <View style={styles.navHeader}>
      <View style={styles.navContent}>
        {/* Primary Navigation Capsule */}
        <View style={styles.navCapsule}>
          <TouchableOpacity
            style={[styles.navBtn, styles.activeBtn]}
            onPress={() => navigateTo('CallCenter')}
          >
            <Text style={styles.activeBtnText}>Call Center</Text>
          </TouchableOpacity>
        </View>

        {/* Agent Status Capsule */}
        <View style={styles.navCapsule}>
          <StatusControls />
        </View>

        {/* User Menu Capsule - Right Aligned */}
        <View style={styles.userMenuContainer}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setMenuVisible(true)}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                fill="#1d1d1f"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    paddingVertical: 16,
    width: '100%',
    paddingHorizontal: 10,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  navCapsule: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    backgroundColor: '#f5f5f7',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  userMenuContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    backgroundColor: '#f5f5f7',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  navBtn: {
    padding: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  activeBtn: {
    backgroundColor: '#1d1d1f',
  },
  activeBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonText: {
    color: '#1d1d1f',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 15,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 5,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontWeight: '500',
  },
  statusButton: {
    padding: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  statusText: {
    color: '#1d1d1f',
    fontWeight: '600',
  },
});

export default NavHeader;
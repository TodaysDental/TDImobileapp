import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform
} from 'react-native';
import { useCallCenter } from '../context/CallCenterProvider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { formatPhoneNumber } from '../utils';

/**
 * A floating toast notification for incoming calls
 * This component automatically shows when there's an incoming call
 */
export const IncomingCallToast: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useCallCenter();
  const slideAnim = React.useRef(new Animated.Value(-200)).current;
  
  // Setup animation and vibration when call arrives
  useEffect(() => {
    if (incomingCall) {
      // Start vibration pattern
      const pattern = [0, 1000, 500, 1000];
      Vibration.vibrate(pattern, true);
      
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      // Stop vibration
      Vibration.cancel();
      
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    
    // Clean up on unmount
    return () => {
      Vibration.cancel();
    };
  }, [incomingCall, slideAnim]);
  
  if (!incomingCall) {
    return null;
  }
  
  const handleAccept = () => {
    Vibration.cancel();
    acceptCall();
  };
  
  const handleReject = () => {
    Vibration.cancel();
    rejectCall();
  };
  
  const formattedNumber = formatPhoneNumber(incomingCall.from);
  
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.contentContainer}>
        <MaterialIcons name="phone-in-talk" size={28} color="#28a745" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Incoming Call</Text>
          <Text style={styles.phoneNumber}>{formattedNumber}</Text>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <MaterialIcons name="call-end" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
        >
          <MaterialIcons name="call" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneNumber: {
    fontSize: 18,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
});

export default IncomingCallToast;
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallCenter } from '../context/CallCenterProvider';
import { Softphone, StatusControls } from '../components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AGENT_STATUS } from '../constants';

/**
 * An example screen showing how to use the call center components
 */
const CallCenterScreen: React.FC = () => {
  const { agentStatus, activeCall } = useCallCenter();
  const [softphoneMinimized, setSoftphoneMinimized] = useState(true);
  
  const isOnline = agentStatus === AGENT_STATUS.ONLINE;
  const isInCall = agentStatus === AGENT_STATUS.IN_CALL;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with status controls */}
      <View style={styles.header}>
        <Text style={styles.title}>Call Center</Text>
        <StatusControls />
      </View>
      
      {/* Main content */}
      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Agent Status</Text>
          <View style={styles.statusContent}>
            <View style={[styles.statusIndicator, getStatusColor(agentStatus)]} />
            <Text style={styles.statusText}>{agentStatus}</Text>
          </View>
        </View>
        
        {isInCall && (
          <View style={styles.callCard}>
            <Text style={styles.callCardTitle}>Active Call</Text>
            <Text style={styles.callInfo}>
              {activeCall?.direction === 'inbound' 
                ? `From: ${activeCall.from}`
                : `To: ${activeCall.to}`}
            </Text>
            <Text style={styles.callDuration}>
              Duration: {getCallDuration(activeCall?.startTime)}
            </Text>
          </View>
        )}
        
        {isOnline && !isInCall && (
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#007bff" />
            <Text style={styles.infoText}>
              You are online and ready to receive calls. Use the softphone icon to make outbound calls.
            </Text>
          </View>
        )}
        
        {!isOnline && (
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#6c757d" />
            <Text style={styles.infoText}>
              You are currently offline. Use the status control in the header to go online.
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Softphone - either minimized or fullscreen */}
      {softphoneMinimized ? (
        <Softphone 
          minimized={true} 
          onToggleMinimize={() => setSoftphoneMinimized(false)} 
        />
      ) : (
        <View style={styles.softphoneContainer}>
          <Softphone 
            minimized={false} 
            onToggleMinimize={() => setSoftphoneMinimized(true)} 
          />
        </View>
      )}
    </SafeAreaView>
  );
};

// Helper function to get status indicator color
const getStatusColor = (status: string) => {
  switch (status) {
    case AGENT_STATUS.ONLINE:
      return { backgroundColor: '#28a745' }; // green
    case AGENT_STATUS.OFFLINE:
      return { backgroundColor: '#6c757d' }; // gray
    case AGENT_STATUS.RINGING:
      return { backgroundColor: '#ffc107' }; // yellow
    case AGENT_STATUS.IN_CALL:
      return { backgroundColor: '#dc3545' }; // red
    case AGENT_STATUS.CONNECTING:
      return { backgroundColor: '#17a2b8' }; // blue
    default:
      return { backgroundColor: '#6c757d' }; // gray
  }
};

// Helper function to format call duration
const getCallDuration = (startTime?: number): string => {
  if (!startTime) return '00:00';
  
  const duration = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
  const seconds = (duration % 60).toString().padStart(2, '0');
  
  return `${minutes}:${seconds}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
  },
  callCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  callCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  callInfo: {
    fontSize: 16,
    marginBottom: 8,
  },
  callDuration: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  softphoneContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
});

export default CallCenterScreen;

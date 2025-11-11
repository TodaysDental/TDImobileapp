import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useCallCenter } from '../context/CallCenterProvider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { formatPhoneNumber } from '../utils';

interface InCallControlsProps {
  compact?: boolean;
}

export const InCallControls: React.FC<InCallControlsProps> = ({ compact = false }) => {
  const {
    activeCall,
    hangUp,
    isMuted,
    toggleMute,
    audioInputs,
    audioOutputs,
    selectedInput,
    selectedOutput,
    selectAudioInput,
    selectAudioOutput,
    transferCall,
  } = useCallCenter();

  const [audioSettingsVisible, setAudioSettingsVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [agents] = useState([
    { id: 'agent1', name: 'Jane Smith' },
    { id: 'agent2', name: 'John Doe' },
    { id: 'agent3', name: 'Mike Johnson' },
  ]); // This would come from an API in a real implementation

  if (!activeCall) {
    return null;
  }

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Call',
          onPress: hangUp,
          style: 'destructive',
        },
      ],
    );
  };

  const handleTransfer = (agentId: string) => {
    Alert.alert(
      'Transfer Call',
      'Are you sure you want to transfer this call?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Transfer',
          onPress: () => {
            transferCall(agentId);
            setTransferModalVisible(false);
          },
        },
      ],
    );
  };

  const callInfo = activeCall ? (
    <View style={styles.callInfoContainer}>
      <Text style={styles.callType}>
        {activeCall.direction === 'inbound' ? 'Incoming Call' : 'Outgoing Call'}
      </Text>
      <Text style={styles.phoneNumber}>
        {activeCall.direction === 'inbound' 
          ? formatPhoneNumber(activeCall.from)
          : formatPhoneNumber(activeCall.to)}
      </Text>
      <Text style={styles.callStatus}>
        {activeCall.status === 'connected' ? 'Connected' : 'Ringing...'}
      </Text>
    </View>
  ) : null;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity 
          style={[styles.iconButton, isMuted && styles.activeIconButton]} 
          onPress={toggleMute}
        >
          <MaterialIcons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#fff" : "#333"} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, styles.endCallButton]} 
          onPress={handleEndCall}
        >
          <MaterialIcons name="call-end" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => setAudioSettingsVisible(true)}
        >
          <MaterialIcons name="settings-voice" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {callInfo}
      
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={toggleMute}
        >
          <View style={[styles.iconCircle, isMuted && styles.activeIconCircle]}>
            <MaterialIcons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#fff" : "#333"} />
          </View>
          <Text style={styles.controlText}>{isMuted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setAudioSettingsVisible(true)}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="settings-voice" size={24} color="#333" />
          </View>
          <Text style={styles.controlText}>Audio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setTransferModalVisible(true)}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="swap-calls" size={24} color="#333" />
          </View>
          <Text style={styles.controlText}>Transfer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleEndCall}
        >
          <View style={[styles.iconCircle, styles.endCallCircle]}>
            <MaterialIcons name="call-end" size={24} color="#fff" />
          </View>
          <Text style={styles.controlText}>End Call</Text>
        </TouchableOpacity>
      </View>
      
      {/* Audio Settings Modal */}
      <Modal
        visible={audioSettingsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAudioSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Audio Settings</Text>
              <TouchableOpacity onPress={() => setAudioSettingsVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Microphone</Text>
            <FlatList
              data={audioInputs}
              keyExtractor={(item) => item.deviceId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.deviceItem,
                    selectedInput === item.deviceId && styles.selectedDevice
                  ]}
                  onPress={() => selectAudioInput(item.deviceId)}
                >
                  <Text style={styles.deviceText}>{item.label}</Text>
                  {selectedInput === item.deviceId && (
                    <MaterialIcons name="check" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.deviceList}
            />
            
            <Text style={styles.sectionTitle}>Speaker</Text>
            <FlatList
              data={audioOutputs}
              keyExtractor={(item) => item.deviceId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.deviceItem,
                    selectedOutput === item.deviceId && styles.selectedDevice
                  ]}
                  onPress={() => selectAudioOutput(item.deviceId)}
                >
                  <Text style={styles.deviceText}>{item.label}</Text>
                  {selectedOutput === item.deviceId && (
                    <MaterialIcons name="check" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.deviceList}
            />
          </View>
        </View>
      </Modal>
      
      {/* Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Call</Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Available Agents</Text>
            <FlatList
              data={agents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.agentItem}
                  onPress={() => handleTransfer(item.id)}
                >
                  <MaterialIcons name="person" size={24} color="#666" style={styles.agentIcon} />
                  <Text style={styles.agentName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.agentList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    margin: 8,
  },
  callInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callType: {
    fontSize: 14,
    color: '#666',
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#28a745',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  controlButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeIconCircle: {
    backgroundColor: '#007bff',
  },
  endCallCircle: {
    backgroundColor: '#dc3545',
  },
  controlText: {
    fontSize: 12,
    color: '#333',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  activeIconButton: {
    backgroundColor: '#007bff',
  },
  endCallButton: {
    backgroundColor: '#dc3545',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  deviceList: {
    maxHeight: 150,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDevice: {
    backgroundColor: '#f0f8ff',
  },
  deviceText: {
    fontSize: 16,
  },
  agentList: {
    maxHeight: 200,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  agentIcon: {
    marginRight: 12,
  },
  agentName: {
    fontSize: 16,
  },
});

export default InCallControls;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  StyleSheet, 
  Alert,
  Pressable
} from 'react-native';
import { useCallCenter } from '../context/CallCenterProvider';
import { AGENT_STATUS } from '../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * This component is designed for React Native to manage the Online/Offline status
 * and clinic selection in a mobile format.
 */
export const StatusControls: React.FC = () => {
  const {
    agentStatus,
    goOnline,
    goOffline,
    availableClinics,
    isConnected
  } = useCallCenter();

  const [menuVisible, setMenuVisible] = useState(false);
  
  // Initialize with all available clinics selected by default
  const [selectedClinics, setSelectedClinics] = useState<Set<string>>(
    () => new Set(availableClinics.map(c => c.clinicId))
  );

  // Update selection if available clinics change after initial load
  useEffect(() => {
    setSelectedClinics(new Set(availableClinics.map(c => c.clinicId)));
  }, [availableClinics]);

  const toggleClinic = (clinicId: string) => {
    const newSelection = new Set(selectedClinics);
    if (newSelection.has(clinicId)) {
      newSelection.delete(clinicId);
    } else {
      newSelection.add(clinicId);
    }
    setSelectedClinics(newSelection);
  };

  const handleGoOnline = () => {
    if (selectedClinics.size === 0) {
      Alert.alert('Warning', 'Please select at least one clinic to be active for.');
      return;
    }
    goOnline(Array.from(selectedClinics));
    setMenuVisible(false);
  };

  const handleGoOffline = () => {
    goOffline();
    setMenuVisible(false);
  };

  const isOffline = agentStatus === AGENT_STATUS.OFFLINE;
  const isConnecting = agentStatus === AGENT_STATUS.CONNECTING;
  const isOnline = agentStatus === AGENT_STATUS.ONLINE;
  const isInCall = agentStatus === AGENT_STATUS.IN_CALL;
  const isRinging = agentStatus === AGENT_STATUS.RINGING;

  // Determine status variant and text
  let badgeColor = '#6c757d'; // Default: Offline (secondary)
  let statusText = agentStatus;

  if (isOnline) {
    badgeColor = '#28a745'; // Success green
    statusText = 'Online';
  }
  if (isInCall) {
    badgeColor = '#dc3545'; // Danger red
    statusText = 'In Call';
  }
  if (isRinging) {
    badgeColor = '#ffc107'; // Warning yellow
    statusText = 'Ringing';
  }

  return (
    <>
      <TouchableOpacity
        style={styles.statusButton}
        onPress={() => setMenuVisible(true)}
        disabled={isConnecting}
      >
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{statusText}</Text>
        </View>
        
        {isConnecting && (
          <View style={[styles.badge, { backgroundColor: '#17a2b8', marginLeft: 4 }]}>
            <Text style={[styles.badgeText, { fontSize: 10 }]}>
              Chime: {isConnected ? 'Connected' : 'Connecting'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agent Status</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {isOffline ? (
              <>
                <Text style={styles.sectionTitle}>Select Active Clinics</Text>
                
                {availableClinics.length > 0 ? (
                  <FlatList
                    data={availableClinics}
                    keyExtractor={(item) => item.clinicId}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.clinicItem}
                        onPress={() => toggleClinic(item.clinicId)}
                      >
                        <View style={styles.checkbox}>
                          {selectedClinics.has(item.clinicId) && (
                            <MaterialIcons name="check" size={16} color="#fff" />
                          )}
                        </View>
                        <Text style={styles.clinicName}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.clinicList}
                  />
                ) : (
                  <Text style={styles.noClinicText}>No clinics available.</Text>
                )}
                
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    styles.primaryButton,
                    (selectedClinics.size === 0 || availableClinics.length === 0) && styles.disabledButton
                  ]}
                  onPress={handleGoOnline}
                  disabled={selectedClinics.size === 0 || availableClinics.length === 0}
                >
                  <MaterialIcons name="check" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Go Online</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.dangerButton,
                  (isInCall || isRinging || isConnecting) && styles.disabledButton
                ]}
                onPress={handleGoOffline}
                disabled={isInCall || isRinging || isConnecting}
              >
                <MaterialIcons name="logout" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Go Offline</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
    color: '#333',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  clinicList: {
    maxHeight: 200,
  },
  clinicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0069d9',
  },
  clinicName: {
    fontSize: 14,
    color: '#333',
  },
  noClinicText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatusControls;
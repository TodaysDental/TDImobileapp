import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Modal } from 'react-native';
import { useCallCenter } from '../context/CallCenterProvider';
import { Dialpad } from './Dialpad';
import { InCallControls } from './InCallControls';
import { IncomingCallToast } from './IncomingCallToast';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AGENT_STATUS } from '../constants';

interface SoftphoneProps {
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

/**
 * A complete softphone component that combines all call center features
 */
const Softphone: React.FC<SoftphoneProps> = ({ 
  minimized = false,
  onToggleMinimize
}) => {
  const { 
    agentStatus, 
    makeOutboundCall, 
    activeCall,
    availableClinics
  } = useCallCenter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [clinicSelectorVisible, setClinicSelectorVisible] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(
    availableClinics.length > 0 ? availableClinics[0].clinicId : null
  );
  
  const isOnline = agentStatus === AGENT_STATUS.ONLINE;
  const isInCall = agentStatus === AGENT_STATUS.IN_CALL;
  
  const handleMakeCall = () => {
    if (isOnline && selectedClinic && phoneNumber) {
      makeOutboundCall(phoneNumber, selectedClinic);
      setPhoneNumber('');
    }
  };
  
  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinic(clinicId);
    setClinicSelectorVisible(false);
  };
  
  if (minimized) {
    return (
      <TouchableOpacity 
        style={styles.minimizedContainer}
        onPress={onToggleMinimize}
      >
        <MaterialIcons 
          name={isInCall ? "phone-in-talk" : "dialpad"}
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <IncomingCallToast />
      
      <View style={styles.header}>
        <Text style={styles.title}>Phone</Text>
        {onToggleMinimize && (
          <TouchableOpacity onPress={onToggleMinimize}>
            <MaterialIcons name="remove" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      
      {isInCall ? (
        <InCallControls />
      ) : (
        <>
          <View style={styles.dialpadContainer}>
            <Dialpad 
              currentNumber={phoneNumber}
              onNumberChange={setPhoneNumber}
            />
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.clinicSelector}
              onPress={() => setClinicSelectorVisible(true)}
              disabled={!isOnline || availableClinics.length <= 1}
            >
              <Text style={styles.clinicText}>
                {selectedClinic ? 
                  availableClinics.find(c => c.clinicId === selectedClinic)?.name || "Select Clinic" : 
                  "Select Clinic"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.callButton,
                (!isOnline || !phoneNumber || !selectedClinic) && styles.disabledButton
              ]}
              onPress={handleMakeCall}
              disabled={!isOnline || !phoneNumber || !selectedClinic}
            >
              <MaterialIcons name="phone" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <Modal
        visible={clinicSelectorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setClinicSelectorVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setClinicSelectorVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Clinic</Text>
              <TouchableOpacity onPress={() => setClinicSelectorVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.clinicList}>
              {availableClinics.map((clinic) => (
                <TouchableOpacity
                  key={clinic.clinicId}
                  style={[
                    styles.clinicItem,
                    selectedClinic === clinic.clinicId && styles.selectedClinic
                  ]}
                  onPress={() => handleSelectClinic(clinic.clinicId)}
                >
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  {selectedClinic === clinic.clinicId && (
                    <MaterialIcons name="check" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dialpadContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  clinicSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    flex: 1,
    marginRight: 16,
  },
  clinicText: {
    flex: 1,
    fontSize: 16,
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clinicList: {
    maxHeight: 300,
  },
  clinicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedClinic: {
    backgroundColor: '#f0f8ff',
  },
  clinicName: {
    fontSize: 16,
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
});

export default Softphone;
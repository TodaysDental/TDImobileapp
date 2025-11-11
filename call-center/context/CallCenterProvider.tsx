/**
 * CallCenterProvider for React Native
 * 
 * This is a React Native implementation of the call center functionality,
 * using the native bridge to the Amazon Chime SDK instead of the web SDK.
 * 
 * Key differences from the web version:
 * - Uses the ChimeNative module for audio/call management
 * - Uses React Native's AsyncStorage instead of localStorage
 * - Uses native platform UI components for alerts and notifications
 * - Handles platform-specific audio routing for iOS and Android
 */

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useAtomValue } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { authTokenAtom } from '../../login/store/atoms';
import { useAgentPresence } from '../hooks/useAgentPresence';
import { chimeApi } from '../services/chimeApi';
import { AGENT_STATUS, POLLING } from '../constants';
import {
  AgentStatus,
  IncomingCall,
  CallSession,
  Device,
  StartSessionResponse,
  ChimeMeetingInfo,
  ChimeAttendeeInfo,
} from '../types';
import {
  ChimeNative,
  ChimeEventEmitter,
  CHIME_EVENTS,
  addChimeEventListener
} from '../native/ChimeNativeModule';
import {
  listAudioDevices,
  setAudioInputDevice,
  setAudioOutputDevice,
  startAudioSession,
  stopAudioSession,
  unlockAudioFocus
} from '../utils/audioDeviceHelpers';

// Helper function to format clinic name
function formatClinicName(clinicId: string): string {
  return clinicId
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/dentistin/gi, 'Dentist in ')
    .replace(/dental/gi, 'Dental ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Clinic information interface
interface ClinicInfo {
  clinicId: string;
  name: string;
  roles: string[];
}

// Context type definition
interface CallCenterContextType {
  agentStatus: AgentStatus;
  goOnline: (clinicIds: string[]) => Promise<void>;
  goOffline: () => Promise<void>;
  incomingCall: IncomingCall | null;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  activeCall: CallSession | null;
  hangUp: () => Promise<void>;
  transferCall: (toAgentId: string) => Promise<void>;
  makeOutboundCall: (phoneNumber: string, clinicId: string) => Promise<void>;
  forceOutboundConnected: () => boolean;
  isMuted: boolean;
  toggleMute: () => void;
  isConnected: boolean;
  unlockAudio: () => Promise<boolean>;
  audioInputs: Device[];
  audioOutputs: Device[];
  selectedInput: string | null;
  selectedOutput: string | null;
  selectAudioInput: (deviceId: string) => Promise<void>; 
  selectAudioOutput: (deviceId: string) => Promise<void>; 
  availableClinics: ClinicInfo[];
}

// Create the context
const CallCenterContext = createContext<CallCenterContextType | null>(null);

// CallCenterProvider component
export const CallCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get agent presence information
  const {
    agentStatus,
    setAgentStatus,
    incomingCall,
    clearIncomingCall,
    startPolling,
    stopPolling
  } = useAgentPresence();

  // State for audio management
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioInputs, setAudioInputs] = useState<Device[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<Device[]>([]);
  const [selectedInput, setSelectedInput] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);

  // State for call management
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const personalSessionRef = useRef<StartSessionResponse | null>(null);
  const callStatusPollRef = useRef<NodeJS.Timeout | null>(null);
  const outboundStatusPollRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get authentication token
  const jotaiToken = useAtomValue(authTokenAtom);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load token from AsyncStorage or jotai
  useEffect(() => {
    const loadToken = async () => {
      try {
        let authToken = jotaiToken;
        
        if (!authToken) {
          const storedToken = await AsyncStorage.getItem('authToken');
          if (storedToken) {
            authToken = JSON.parse(storedToken);
          }
        }
        
        if (authToken) {
          setToken(authToken);
          chimeApi.setAuthToken(authToken);
          
          // Extract user ID from token
          try {
            const parts = typeof authToken === 'string' ? authToken.split('.') : [];
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              if (payload.sub) {
                setUserId(payload.sub);
              }
            }
          } catch (e) {
            console.error('[CallCenterProvider] Failed to parse token payload:', e);
          }
        } else {
          setToken(null);
          setUserId(null);
          chimeApi.setAuthToken(null);
        }
      } catch (error) {
        console.error('[CallCenterProvider] Failed to load token:', error);
        setToken(null);
        setUserId(null);
      }
    };
    
    loadToken();
  }, [jotaiToken]);

  // Set up Chime event listeners
  useEffect(() => {
    // Set up event listeners for Chime events
    const meetingStartSubscription = addChimeEventListener(
      CHIME_EVENTS.ON_MEETING_START,
      (event) => {
        console.log('[CallCenterProvider] Meeting started:', event);
        setIsConnected(true);
      }
    );
    
    const meetingEndSubscription = addChimeEventListener(
      CHIME_EVENTS.ON_MEETING_END,
      (event) => {
        console.log('[CallCenterProvider] Meeting ended:', event);
        setIsConnected(false);
      }
    );
    
    const audioStatusSubscription = addChimeEventListener(
      CHIME_EVENTS.ON_AUDIO_STATUS_CHANGED,
      (event) => {
        if (event && typeof event.muted === 'boolean') {
          setIsMuted(event.muted);
        }
      }
    );
    
    const errorSubscription = addChimeEventListener(
      CHIME_EVENTS.ON_ERROR,
      (event) => {
        console.error('[CallCenterProvider] Chime error:', event);
        Alert.alert('Call Error', event?.errorMessage || 'An error occurred with the call');
      }
    );
    
    // Clean up subscriptions
    return () => {
      meetingStartSubscription.remove();
      meetingEndSubscription.remove();
      audioStatusSubscription.remove();
      errorSubscription.remove();
      
      // Also clean up any timers
      if (callStatusPollRef.current) clearInterval(callStatusPollRef.current);
      if (outboundStatusPollRef.current) clearInterval(outboundStatusPollRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    };
  }, []);
  
  // Get available clinics from token
  const [availableClinics, setAvailableClinics] = useState<ClinicInfo[]>([]);
  
  useEffect(() => {
    if (!token) {
      setAvailableClinics([]);
      return;
    }
    
    try {
      // Extract clinic information from token
      const clean = typeof token === 'string' ? token : '';
      const parts = clean.split('.');
      
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        const groups: string[] = Array.isArray(payload?.['cognito:groups']) 
          ? payload['cognito:groups'] as string[] 
          : [];
        
        const clinicMap = new Map<string, string[]>();
        
        // Parse groups for clinic access
        groups.forEach((group: string) => {
          const match = /^clinic_([^_][^\s]*)__([A-Z_]+)$/.exec(group);
          if (match) {
            const clinicId = match[1];
            const role = match[2];
            
            if (!clinicMap.has(clinicId)) {
              clinicMap.set(clinicId, []);
            }
            
            const roles = clinicMap.get(clinicId) || [];
            if (!roles.includes(role)) {
              roles.push(role);
              clinicMap.set(clinicId, roles);
            }
          }
        });
        
        // Parse x_rbc field if available
        const xRbc = String(payload?.['x_rbc'] || '').trim();
        if (xRbc) {
          xRbc.split(',').forEach((pair: string) => {
            const [clinicId, code] = pair.split(':');
            if (clinicId && code) {
              const role = codeToRoleKey(code);
              if (role) {
                if (!clinicMap.has(clinicId)) {
                  clinicMap.set(clinicId, []);
                }
                
                const roles = clinicMap.get(clinicId) || [];
                if (!roles.includes(role)) {
                  roles.push(role);
                  clinicMap.set(clinicId, roles);
                }
              }
            }
          });
        }
        
        // Convert map to array of clinic info
        const clinics = Array.from(clinicMap.keys()).map((clinicId: string) => ({
          clinicId,
          name: formatClinicName(clinicId),
          roles: clinicMap.get(clinicId) || ['USER']
        }));
        
        setAvailableClinics(clinics);
      }
    } catch (error) {
      console.error('[CallCenterProvider] Failed to extract clinic information:', error);
      setAvailableClinics([]);
    }
  }, [token]);
  
  // Helper function to convert role codes to role keys
  const codeToRoleKey = (code: string): string => {
    switch (String(code).toUpperCase()) {
      case "S": return "SUPER_ADMIN";
      case "A": return "ADMIN";
      case "P": return "PROVIDER";
      case "D": return "DOCTOR";
      case "H": return "HYGIENIST";
      case "DA": return "DENTAL_ASSISTANT";
      case "TC": return "TRAINEE";
      case "PC": return "PATIENT_COORDINATOR";
      case "M": return "MARKETING";
      case "U": return "USER";
      default: return "";
    }
  };
  
  // Calculate call duration
  const calculateDuration = (startTime: number): number => {
    return Math.floor((Date.now() - startTime) / 1000);
  };
  
  // Core methods for call management
  
  // Toggle mute
  const toggleMute = useCallback(async () => {
    try {
      if (isMuted) {
        await ChimeNative.unmute();
        setIsMuted(false);
      } else {
        await ChimeNative.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('[CallCenterProvider] Error toggling mute:', error);
      Alert.alert('Error', 'Failed to toggle mute. Please try again.');
    }
  }, [isMuted]);
  
  // Unlock audio (needed for some platforms)
  const unlockAudio = useCallback(async (): Promise<boolean> => {
    try {
      const result = await unlockAudioFocus();
      return result;
    } catch (error) {
      console.error('[CallCenterProvider] Error unlocking audio:', error);
      return false;
    }
  }, []);
  
  // Select audio input device
  const selectAudioInput = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await setAudioInputDevice(deviceId);
      setSelectedInput(deviceId);
    } catch (error) {
      console.error('[CallCenterProvider] Error selecting audio input device:', error);
      Alert.alert('Error', 'Failed to set audio input device.');
    }
  }, []);
  
  // Select audio output device
  const selectAudioOutput = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await setAudioOutputDevice(deviceId);
      setSelectedOutput(deviceId);
    } catch (error) {
      console.error('[CallCenterProvider] Error selecting audio output device:', error);
      Alert.alert('Error', 'Failed to set audio output device.');
    }
  }, []);
  
  // Go online
  const goOnline = useCallback(async (clinicIds: string[]) => {
    if (!userId || !token) {
      console.warn('[CallCenterProvider] Cannot go online without user/token.');
      return;
    }
    
    const allowedClinicIds = availableClinics.map(c => c.clinicId);
    const unauthorized = clinicIds.filter(id => !allowedClinicIds.includes(id));
    
    if (unauthorized.length > 0) {
      const msg = `You are not authorized for these clinics: ${unauthorized.join(', ')}`;
      console.warn('[CallCenterProvider] Unauthorized clinic selection:', unauthorized);
      Alert.alert('Unauthorized', msg);
      return;
    }
    
    if (agentStatus !== AGENT_STATUS.OFFLINE) {
      console.warn(`[CallCenterProvider] Cannot go online, current status: ${agentStatus}`);
      return;
    }
    
    console.log('[CallCenterProvider] Attempting to go ONLINE...');
    setAgentStatus(AGENT_STATUS.CONNECTING);
    
    // Set a timeout to prevent hanging in "connecting" state
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    
    connectionTimeoutRef.current = setTimeout(() => {
      setAgentStatus((currentStatus) => {
        if (currentStatus === AGENT_STATUS.CONNECTING) {
          console.warn('[CallCenterProvider] Connection timeout reached. Forcing state to OFFLINE.');
          Alert.alert('Connection Timeout', 'Failed to connect. Please try again.');
          return AGENT_STATUS.OFFLINE;
        }
        return currentStatus;
      });
    }, POLLING.CONNECTION_TIMEOUT);
    
    try {
      // Start audio session first
      await startAudioSession();
      
      // Start session on the backend
      const sessionData = await chimeApi.startSession(clinicIds);
      console.log('[CallCenterProvider] Session data received:', sessionData);
      personalSessionRef.current = sessionData;
      
      if (!sessionData?.meeting || !sessionData?.attendee) {
        throw new Error('Invalid session data from server');
      }
      
      // Join the Chime meeting
      const success = await ChimeNative.joinMeeting(
        sessionData.meeting,
        sessionData.attendee
      );
      
      if (!success) {
        throw new Error('Failed to join Chime meeting');
      }
      
      console.log('[CallCenterProvider] Successfully joined Chime meeting');
      
      // Set the agent status to online
      setAgentStatus(AGENT_STATUS.ONLINE);
      startPolling();
      
      // Load audio devices
      const devices = await listAudioDevices();
      setAudioInputs(devices.inputDevices);
      setAudioOutputs(devices.outputDevices);
      
      // Select default devices
      if (devices.inputDevices.length > 0) {
        await selectAudioInput(devices.inputDevices[0].deviceId);
      }
      
      if (devices.outputDevices.length > 0) {
        await selectAudioOutput(devices.outputDevices[0].deviceId);
      }
      
      // Clear the timeout and show success message
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      Alert.alert('Success', 'You are now online and ready to receive calls');
      
    } catch (error) {
      console.error('[CallCenterProvider] Failed to go online:', error);
      
      try {
        // Cleanup
        await ChimeNative.leaveMeeting();
        await stopAudioSession();
      } catch (cleanupError) {
        console.warn('[CallCenterProvider] Error during cleanup:', cleanupError);
      }
      
      personalSessionRef.current = null;
      setAgentStatus(AGENT_STATUS.OFFLINE);
      stopPolling();
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      let errorMsg = 'Failed to connect. Please check your internet connection and try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMsg = 'Microphone permission denied. Please allow microphone access.';
        } else if (error.message.includes('device')) {
          errorMsg = 'Audio device error. Please check your microphone and speakers.';
        } else {
          errorMsg = `Connection error: ${error.message}`;
        }
      }
      
      Alert.alert('Connection Failed', errorMsg);
    }
  }, [userId, token, agentStatus, availableClinics, startPolling, stopPolling, selectAudioInput, selectAudioOutput]);
  
  // Go offline
  const goOffline = useCallback(async () => {
    if (agentStatus === AGENT_STATUS.OFFLINE) {
      return;
    }
    
    if (agentStatus === AGENT_STATUS.CONNECTING) {
      console.warn('[CallCenterProvider] Cannot go offline while connecting.');
      return; 
    }
    
    console.log('[CallCenterProvider] Attempting to go OFFLINE...');
    
    // Clear any polling intervals
    if (callStatusPollRef.current) {
      clearInterval(callStatusPollRef.current);
      callStatusPollRef.current = null;
    }
    
    if (outboundStatusPollRef.current) {
      clearInterval(outboundStatusPollRef.current);
      outboundStatusPollRef.current = null;
    }
    
    setAgentStatus(AGENT_STATUS.CONNECTING);
    
    try {
      stopPolling();
      
      // Leave the Chime meeting
      await ChimeNative.leaveMeeting();
      
      // Stop the audio session
      await stopAudioSession();
      
      try {
        // Notify the backend
        await chimeApi.stopSession();
        console.log('[CallCenterProvider] stopSession succeeded on server.');
      } catch (e) {
        console.error('[CallCenterProvider] stopSession failed:', e);
        Alert.alert('Warning', 'Server error stopping session.');
      }
      
      personalSessionRef.current = null;
      setActiveCall(null);
      clearIncomingCall();
      
      setAgentStatus(AGENT_STATUS.OFFLINE);
      console.log('[CallCenterProvider] Agent is OFFLINE.');
      
    } catch (err) {
      console.error('[CallCenterProvider] Failed to go offline:', err);
      
      // Force offline state anyway
      setAgentStatus(AGENT_STATUS.OFFLINE);
      personalSessionRef.current = null;
      setActiveCall(null);
      clearIncomingCall();
    }
  }, [agentStatus, stopPolling, clearIncomingCall]);
  
  // Accept call
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !userId) {
      console.warn('[CallCenterProvider] Cannot accept call: No incoming call or user data.');
      return;
    }
    
    if (agentStatus !== AGENT_STATUS.RINGING) {
      console.warn(`[CallCenterProvider] Cannot accept call, status is not RINGING: ${agentStatus}`);
      return;
    }
    
    console.log('[CallCenterProvider] Attempting to ACCEPT call...');
    
    // Set status to in call (optimistic update)
    setAgentStatus(AGENT_STATUS.IN_CALL);
    
    try {
      // Notify the backend
      await chimeApi.notifyCallAccepted({
        callId: incomingCall.callId,
        agentId: userId
      });
      
      console.log('[CallCenterProvider] Backend notified of call acceptance.');
      
      // Update active call state
      setActiveCall({
        callId: incomingCall.callId,
        direction: 'inbound',
        from: incomingCall.from,
        to: 'Agent',
        status: 'connected',
        startTime: Date.now()
      });
      
      clearIncomingCall();
      
      // Make sure audio is ready
      try {
        await unlockAudio();
        console.log('[CallCenterProvider] Post-accept audio unlock succeeded.');
      } catch (e) {
        console.warn(`[CallCenterProvider] Post-accept audio unlock failed (non-fatal): ${e}`);
        Alert.alert('Audio Notice', 'Call connected. Click the audio button if you hear no sound.');
      }
      
    } catch (err) {
      console.error('[CallCenterProvider] Failed to accept call:', err);
      
      // Go back to online state
      clearIncomingCall();
      setAgentStatus(AGENT_STATUS.ONLINE);
      startPolling(); // Start polling again
      
      Alert.alert('Call Error', `Failed to accept call: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [incomingCall, userId, agentStatus, setAgentStatus, clearIncomingCall, startPolling, unlockAudio]);
  
  // Reject call
  const rejectCall = useCallback(async () => {
    if (!incomingCall || !userId) {
      console.warn('[CallCenterProvider] Cannot reject call: No incoming call or user data.');
      return;
    }
    
    if (agentStatus !== AGENT_STATUS.RINGING) {
      console.warn(`[CallCenterProvider] Cannot reject call, status is not RINGING: ${agentStatus}`);
      return;
    }
    
    console.log('[CallCenterProvider] Attempting to REJECT call...');
    
    try {
      await chimeApi.notifyCallRejected({
        callId: incomingCall.callId,
        agentId: userId,
        reason: 'Agent rejected'
      });
      
      console.log('[CallCenterProvider] Notified backend of call rejection.');
      
      clearIncomingCall();
      
      if (isConnected) {
        setAgentStatus(AGENT_STATUS.ONLINE);
        startPolling();
        console.log('[CallCenterProvider] Call rejected. Agent back ONLINE.');
      } else {
        console.warn('[CallCenterProvider] Was not connected during rejection. Going offline.');
        await goOffline();
      }
      
    } catch (err) {
      console.error('[CallCenterProvider] Failed to reject call:', err);
      
      clearIncomingCall();
      
      if (isConnected) {
        setAgentStatus(AGENT_STATUS.ONLINE);
        startPolling();
      } else {
        await goOffline();
      }
    }
  }, [incomingCall, userId, agentStatus, isConnected, setAgentStatus, clearIncomingCall, startPolling, goOffline]);
  
  // Hang up call
  const hangUp = useCallback(async () => {
    if (!activeCall || !userId) {
      console.warn('[CallCenterProvider] Cannot hang up: No active call or user data.');
      return;
    }
    
    console.log('[CallCenterProvider] Attempting to HANG UP call...');
    const callToHangup = activeCall;
    
    // Clear any lingering call state timers
    if (callStatusPollRef.current) {
      clearInterval(callStatusPollRef.current);
      callStatusPollRef.current = null;
    }
    
    if (outboundStatusPollRef.current) {
      clearInterval(outboundStatusPollRef.current);
      outboundStatusPollRef.current = null;
    }
    
    // Set a temporary "connecting" state while we wait for the API
    setAgentStatus(AGENT_STATUS.CONNECTING);
    
    try {
      const duration = callToHangup.startTime ? calculateDuration(callToHangup.startTime) : 0;
      
      try {
        await chimeApi.notifyCallHungUp({
          callId: callToHangup.callId,
          agentId: userId,
          duration: duration,
          reason: 'Agent hung up'
        });
        console.log('[CallCenterProvider] Notified backend of hangup.');
      } catch (notifyErr) {
        console.warn('[CallCenterProvider] notifyCallHungUp failed:', notifyErr);
        // Don't stop, proceed with cleanup
      }
      
      // Set state back to Online and restart polling
      setActiveCall(null);
      setAgentStatus(AGENT_STATUS.ONLINE);
      startPolling();
      console.log('[CallCenterProvider] Hangup complete. Agent is ONLINE and polling.');
      
    } catch (err) {
      console.error('[CallCenterProvider] Failed to hang up:', err);
      // If hangup fails, something is very wrong. Force offline.
      setActiveCall(null);
      await goOffline();
    }
  }, [activeCall, userId, setAgentStatus, startPolling, goOffline]);
  
  // Make outbound call
  const makeOutboundCall = useCallback(async (toPhoneNumber: string, fromClinicId: string) => {
    if (agentStatus !== AGENT_STATUS.ONLINE || !isConnected) {
      console.warn(`[CallCenterProvider] Cannot make outbound call. Status: ${agentStatus}, Connected: ${isConnected}`);
      Alert.alert('Call Error', 'Cannot make outbound call. Ensure you are "Online" and connected.');
      return;
    }
    
    console.log(`[CallCenterProvider] Attempting OUTBOUND call to ${toPhoneNumber} from ${fromClinicId}...`);
    // Set status to RINGING (which means "Dialing" for outbound)
    setAgentStatus(AGENT_STATUS.RINGING);
    stopPolling(); // Stop polling while we're dialing
    
    try {
      // Make the call via the API
      const response = await chimeApi.outboundCall({
        toPhoneNumber,
        fromClinicId
      });
      
      console.log(`[CallCenterProvider] Outbound call initiated. Call ID: ${response.callId}`);
      
      // Set the active call in "ringing" (dialing) state
      setActiveCall({
        callId: response.callId,
        direction: 'outbound',
        from: fromClinicId,
        to: toPhoneNumber,
        status: 'ringing',
        startTime: Date.now()
      });
      
      // Restart polling to detect status changes
      startPolling();
      
    } catch (err) {
      console.error('[CallCenterProvider] Failed to make outbound call:', err);
      setActiveCall(null);
      setAgentStatus(AGENT_STATUS.ONLINE);
      startPolling(); // Restart polling on failure
      Alert.alert('Call Error', `Failed to initiate outbound call: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [agentStatus, isConnected, setAgentStatus, startPolling, stopPolling]);
  
  // Force outbound connected (used for UI fixes)
  const forceOutboundConnected = useCallback(() => {
    if (agentStatus === AGENT_STATUS.RINGING && activeCall && activeCall.direction === 'outbound') {
      console.log('[CallCenterProvider] Manual force transition to IN_CALL state.');
      
      if (outboundStatusPollRef.current) {
        clearInterval(outboundStatusPollRef.current);
        outboundStatusPollRef.current = null;
      }
      
      if (callStatusPollRef.current) {
        clearTimeout(callStatusPollRef.current);
        callStatusPollRef.current = null;
      }
      
      setActiveCall(prev => prev ? { 
        ...prev, 
        status: 'connected', 
        startTime: Date.now() 
      } : null);
      
      setAgentStatus(AGENT_STATUS.IN_CALL);
      
      return true;
    }
    return false;
  }, [agentStatus, activeCall, setAgentStatus]);
  
  // Transfer call
  const transferCall = useCallback(async (toAgentId: string) => {
    if (!activeCall || !userId) {
      console.warn('[CallCenterProvider] Cannot transfer: No active call or user data.');
      return;
    }
    
    if (agentStatus !== AGENT_STATUS.IN_CALL) {
      console.warn(`[CallCenterProvider] Cannot transfer, status is not IN_CALL: ${agentStatus}`);
      return;
    }
    
    console.log(`[CallCenterProvider] Attempting TRANSFER call ${activeCall.callId} to ${toAgentId}...`);
    
    try {
      await chimeApi.transferCall({
        callId: activeCall.callId,
        fromAgentId: userId,
        toAgentId,
      });
      console.log('[CallCenterProvider] Transfer initiated via API.');
      
      await hangUp();
      console.log('[CallCenterProvider] Transfer initiated. Current agent hung up and went back online.');
      Alert.alert('Transfer', 'Call transfer initiated.');
      
    } catch (err) {
      console.error('[CallCenterProvider] Failed to transfer call:', err);
      Alert.alert('Transfer Error', `Failed to initiate transfer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      if (agentStatus === AGENT_STATUS.IN_CALL) {
        await hangUp();
      }
    }
  }, [activeCall, userId, agentStatus, hangUp]);
  
  // Provider value
  return (
    <CallCenterContext.Provider
      value={{
        agentStatus,
        goOnline,
        goOffline,
        incomingCall,
        acceptCall,
        rejectCall,
        activeCall,
        hangUp,
        transferCall,
        makeOutboundCall,
        forceOutboundConnected,
        unlockAudio,
        isMuted,
        toggleMute,
        isConnected,
        availableClinics,
        selectAudioInput,
        selectAudioOutput,
        audioInputs,
        audioOutputs,
        selectedInput,
        selectedOutput,
      }}
    >
      {children}
    </CallCenterContext.Provider>
  );
};

// Hook to use the CallCenterContext
export const useCallCenter = () => {
  const context = useContext(CallCenterContext);
  if (!context) {
    throw new Error('useCallCenter must be used within a CallCenterProvider');
  }
  return context;
};
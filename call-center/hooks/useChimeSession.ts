import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { ChimeNative, ChimeEventEmitter, CHIME_EVENTS } from '../native/ChimeNativeModule';
import {
  ChimeMeetingInfo, 
  ChimeAttendeeInfo, 
  AudioDevice, 
  MeetingSession 
} from '../types/chime';
import { listAudioDevices } from '../utils/audioDeviceHelpers';
import { Device } from '../types';

interface ChimeSessionState {
  meetingId: string | null;
  attendeeId: string | null;
  isConnected: boolean;
  isMuted: boolean;
  meetingSession: MeetingSession | null;
}

interface ChimeSessionReturn {
  meetingId: string | null;
  attendeeId: string | null;
  isConnected: boolean;
  isMuted: boolean;
  audioInputDevices: Device[];
  audioOutputDevices: Device[];
  selectedAudioInputDevice: string | null;
  selectedAudioOutputDevice: string | null;
  connect: (meetingInfo: ChimeMeetingInfo, attendeeInfo: ChimeAttendeeInfo) => Promise<boolean>;
  disconnect: () => Promise<void>;
  mute: () => Promise<void>;
  unmute: () => Promise<void>;
  selectAudioInputDevice: (deviceId: string) => Promise<void>;
  selectAudioOutputDevice: (deviceId: string) => Promise<void>;
  unlockAudio: () => Promise<boolean>;
}

export const useChimeSession = (): ChimeSessionReturn => {
  const [state, setState] = useState<ChimeSessionState>({
    meetingId: null,
    attendeeId: null,
    isConnected: false,
    isMuted: false,
    meetingSession: null,
  });
  
  const [audioInputDevices, setAudioInputDevices] = useState<Device[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<Device[]>([]);
  const [selectedAudioInputDevice, setSelectedAudioInputDevice] = useState<string | null>(null);
  const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] = useState<string | null>(null);
  
  // Refresh audio devices when connection state changes
  useEffect(() => {
    if (state.isConnected) {
      refreshAudioDevices();
    }
  }, [state.isConnected]);
  
  // Set up event listeners for Chime events
  useEffect(() => {
    // Listen for meeting start events
    const meetingStartSubscription = ChimeEventEmitter.addListener(
      CHIME_EVENTS.ON_MEETING_START,
      (event) => {
        console.log('[useChimeSession] Meeting started:', event);
        if (event?.meetingId) {
          setState(prevState => ({
            ...prevState,
            isConnected: true,
            meetingId: event.meetingId
          }));
        }
      }
    );
    
    // Listen for meeting end events
    const meetingEndSubscription = ChimeEventEmitter.addListener(
      CHIME_EVENTS.ON_MEETING_END,
      () => {
        console.log('[useChimeSession] Meeting ended');
        setState(prevState => ({
          ...prevState,
          isConnected: false,
          meetingId: null,
          attendeeId: null
        }));
      }
    );
    
    // Listen for audio status changed events
    const audioStatusSubscription = ChimeEventEmitter.addListener(
      CHIME_EVENTS.ON_AUDIO_STATUS_CHANGED,
      (event) => {
        console.log('[useChimeSession] Audio status changed:', event);
        if (event && typeof event.muted === 'boolean') {
          setState(prevState => ({
            ...prevState,
            isMuted: event.muted
          }));
        }
      }
    );
    
    // Listen for device changed events
    const deviceChangedSubscription = ChimeEventEmitter.addListener(
      CHIME_EVENTS.ON_DEVICE_CHANGED,
      (event) => {
        console.log('[useChimeSession] Device changed:', event);
        if (event?.inputDevice) {
          setSelectedAudioInputDevice(event.inputDevice);
        }
        if (event?.outputDevice) {
          setSelectedAudioOutputDevice(event.outputDevice);
        }
        // Refresh the device list
        refreshAudioDevices();
      }
    );
    
    // Listen for errors
    const errorSubscription = ChimeEventEmitter.addListener(
      CHIME_EVENTS.ON_ERROR,
      (event) => {
        console.error('[useChimeSession] Chime error:', event);
        Alert.alert('Call Error', event?.errorMessage || 'An error occurred with the call');
      }
    );
    
    // Clean up subscriptions
    return () => {
      meetingStartSubscription.remove();
      meetingEndSubscription.remove();
      audioStatusSubscription.remove();
      deviceChangedSubscription.remove();
      errorSubscription.remove();
    };
  }, []);
  
  // Refresh the list of audio devices
  const refreshAudioDevices = useCallback(async () => {
    try {
      const { inputDevices, outputDevices } = await listAudioDevices();
      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);
      
      // Select the first device if none is selected
      if (inputDevices.length > 0 && !selectedAudioInputDevice) {
        setSelectedAudioInputDevice(inputDevices[0].deviceId);
        await ChimeNative.setAudioInputDevice(inputDevices[0].deviceId);
      }
      
      if (outputDevices.length > 0 && !selectedAudioOutputDevice) {
        setSelectedAudioOutputDevice(outputDevices[0].deviceId);
        await ChimeNative.setAudioOutputDevice(outputDevices[0].deviceId);
      }
    } catch (error) {
      console.error('[useChimeSession] Error refreshing audio devices:', error);
    }
  }, [selectedAudioInputDevice, selectedAudioOutputDevice]);
  
  // Connect to a Chime meeting
  const connect = useCallback(async (
    meetingInfo: ChimeMeetingInfo, 
    attendeeInfo: ChimeAttendeeInfo
  ): Promise<boolean> => {
    try {
      console.log('[useChimeSession] Connecting to meeting:', meetingInfo.MeetingId);
      
      // Start audio session before joining meeting
      await ChimeNative.startAudioSession();
      
      // Join the meeting
      const success = await ChimeNative.joinMeeting(meetingInfo, attendeeInfo);
      
      if (success) {
        setState(prevState => ({
          ...prevState,
          meetingId: meetingInfo.MeetingId,
          attendeeId: attendeeInfo.AttendeeId,
          // The isConnected state will be set by the event listener
        }));
        
        // Refresh audio devices after connecting
        await refreshAudioDevices();
        
        return true;
        } else {
        throw new Error('Failed to join meeting');
      }
    } catch (error) {
      console.error('[useChimeSession] Error connecting to meeting:', error);
      
      // Clean up if connection fails
      try {
        await ChimeNative.stopAudioSession();
      } catch (cleanupError) {
        console.warn('[useChimeSession] Error stopping audio session:', cleanupError);
      }
      
      // Show error alert
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Connection Error',
        `Failed to connect to the meeting: ${errorMessage}`,
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [refreshAudioDevices]);
  
  // Disconnect from a Chime meeting
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      console.log('[useChimeSession] Disconnecting from meeting');
      await ChimeNative.leaveMeeting();
      await ChimeNative.stopAudioSession();
      
      // State will be updated by the event listener
    } catch (error) {
      console.error('[useChimeSession] Error disconnecting from meeting:', error);
      
      // Force the state to disconnected even if there was an error
      setState(prevState => ({
        ...prevState,
        isConnected: false,
        meetingId: null,
        attendeeId: null
      }));
    }
  }, []);
  
  // Mute audio
  const mute = useCallback(async (): Promise<void> => {
    try {
      await ChimeNative.mute();
      setState(prevState => ({
        ...prevState,
        isMuted: true
      }));
    } catch (error) {
      console.error('[useChimeSession] Error muting audio:', error);
      Alert.alert('Error', 'Failed to mute audio');
    }
  }, []);
  
  // Unmute audio
  const unmute = useCallback(async (): Promise<void> => {
    try {
      await ChimeNative.unmute();
      setState(prevState => ({
        ...prevState,
        isMuted: false
      }));
    } catch (error) {
      console.error('[useChimeSession] Error unmuting audio:', error);
      Alert.alert('Error', 'Failed to unmute audio');
    }
  }, []);
  
  // Select audio input device
  const selectAudioInputDevice = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await ChimeNative.setAudioInputDevice(deviceId);
      setSelectedAudioInputDevice(deviceId);
    } catch (error) {
      console.error('[useChimeSession] Error selecting audio input device:', error);
      Alert.alert('Error', 'Failed to select audio input device');
    }
  }, []);
  
  // Select audio output device
  const selectAudioOutputDevice = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await ChimeNative.setAudioOutputDevice(deviceId);
      setSelectedAudioOutputDevice(deviceId);
    } catch (error) {
      console.error('[useChimeSession] Error selecting audio output device:', error);
      Alert.alert('Error', 'Failed to select audio output device');
    }
  }, []);
  
  // Unlock audio focus (needed for some platforms, especially iOS)
  const unlockAudio = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ChimeNative.unlockAudioFocus();
      return result;
    } catch (error) {
      console.error('[useChimeSession] Error unlocking audio focus:', error);
      return false;
    }
  }, []);

  return {
    meetingId: state.meetingId,
    attendeeId: state.attendeeId,
    isConnected: state.isConnected,
    isMuted: state.isMuted,
    audioInputDevices,
    audioOutputDevices,
    selectedAudioInputDevice,
    selectedAudioOutputDevice,
    connect,
    disconnect,
    mute,
    unmute,
    selectAudioInputDevice,
    selectAudioOutputDevice,
    unlockAudio,
  };
};
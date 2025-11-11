import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { 
  ChimeMeetingInfo, 
  ChimeAttendeeInfo, 
  AudioDevice 
} from '../types/chime';

interface ChimeNativeInterface {
  // Meeting creation and management
  createMeeting: (meetingId: string) => Promise<ChimeMeetingInfo>;
  joinMeeting: (meetingInfo: ChimeMeetingInfo, attendeeInfo: ChimeAttendeeInfo) => Promise<boolean>;
  leaveMeeting: () => Promise<boolean>;
  
  // Audio controls
  mute: () => Promise<boolean>;
  unmute: () => Promise<boolean>;
  isMuted: () => Promise<boolean>;
  
  // Audio device management
  getAudioDevices: () => Promise<{ inputDevices: AudioDevice[], outputDevices: AudioDevice[] }>;
  setAudioInputDevice: (deviceId: string) => Promise<boolean>;
  setAudioOutputDevice: (deviceId: string) => Promise<boolean>;
  
  // Audio session management
  startAudioSession: () => Promise<boolean>;
  stopAudioSession: () => Promise<boolean>;
  
  // Utility functions
  unlockAudioFocus: () => Promise<boolean>;
}

// Get the native module or create a mock implementation if it's not available
const getNativeModule = (): ChimeNativeInterface => {
  const { ChimeSDKModule } = NativeModules;
  
  if (!ChimeSDKModule) {
    console.warn(
      'ChimeSDKModule not found. Make sure the native module is properly linked. ' +
      'Using mock implementation for now.'
    );
    
    // Return mock implementation
    return {
      createMeeting: async () => {
        console.warn('createMeeting called on mock module');
        throw new Error('Native module not available');
      },
      joinMeeting: async () => {
        console.warn('joinMeeting called on mock module');
        throw new Error('Native module not available');
      },
      leaveMeeting: async () => {
        console.warn('leaveMeeting called on mock module');
        throw new Error('Native module not available');
      },
      mute: async () => {
        console.warn('mute called on mock module');
        throw new Error('Native module not available');
      },
      unmute: async () => {
        console.warn('unmute called on mock module');
        throw new Error('Native module not available');
      },
      isMuted: async () => {
        console.warn('isMuted called on mock module');
        throw new Error('Native module not available');
      },
      getAudioDevices: async () => {
        console.warn('getAudioDevices called on mock module');
        throw new Error('Native module not available');
      },
      setAudioInputDevice: async () => {
        console.warn('setAudioInputDevice called on mock module');
        throw new Error('Native module not available');
      },
      setAudioOutputDevice: async () => {
        console.warn('setAudioOutputDevice called on mock module');
        throw new Error('Native module not available');
      },
      startAudioSession: async () => {
        console.warn('startAudioSession called on mock module');
        throw new Error('Native module not available');
      },
      stopAudioSession: async () => {
        console.warn('stopAudioSession called on mock module');
        throw new Error('Native module not available');
      },
      unlockAudioFocus: async () => {
        console.warn('unlockAudioFocus called on mock module');
        throw new Error('Native module not available');
      }
    };
  }
  
  return ChimeSDKModule;
};

// Create an event emitter for native events
const createChimeEventEmitter = () => {
  const { ChimeSDKModule } = NativeModules;
  
  if (ChimeSDKModule) {
    return new NativeEventEmitter(ChimeSDKModule);
  }
  
  return {
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {}
  };
};

// Chime SDK Native Module
export const ChimeNative = getNativeModule();

// Event constants
export const CHIME_EVENTS = {
  ON_MEETING_START: 'onMeetingStart',
  ON_MEETING_END: 'onMeetingEnd',
  ON_ATTENDEE_JOIN: 'onAttendeeJoin',
  ON_ATTENDEE_LEAVE: 'onAttendeeLeave',
  ON_AUDIO_STATUS_CHANGED: 'onAudioStatusChanged',
  ON_ERROR: 'onError',
  ON_DEVICE_CHANGED: 'onDeviceChanged',
};

// Create event emitter
export const ChimeEventEmitter = createChimeEventEmitter();

// Helper functions
export const addChimeEventListener = (
  eventName: string, 
  listener: (...args: any[]) => void
) => {
  const subscription = ChimeEventEmitter.addListener(eventName, listener);
  return subscription;
};

export const removeChimeEventListener = (eventName: string) => {
  ChimeEventEmitter.removeAllListeners(eventName);
};

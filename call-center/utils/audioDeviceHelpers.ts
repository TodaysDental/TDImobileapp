import { Platform } from 'react-native';
import { ChimeNative } from '../native/ChimeNativeModule';
import { AudioDevice } from '../types';

/**
 * Gets the list of available audio devices from the native module
 */
export const listAudioDevices = async (): Promise<{
  inputDevices: AudioDevice[],
  outputDevices: AudioDevice[]
}> => {
  try {
    const devices = await ChimeNative.getAudioDevices();
    return devices;
  } catch (error) {
    console.error('Failed to list audio devices:', error);
    return {
      inputDevices: [],
      outputDevices: []
    };
  }
};

/**
 * Sets the audio input device
 * @param deviceId The ID of the input device to use
 */
export const setAudioInputDevice = async (deviceId: string): Promise<boolean> => {
  try {
    return await ChimeNative.setAudioInputDevice(deviceId);
  } catch (error) {
    console.error('Failed to set audio input device:', error);
    return false;
  }
};

/**
 * Sets the audio output device
 * @param deviceId The ID of the output device to use
 */
export const setAudioOutputDevice = async (deviceId: string): Promise<boolean> => {
  try {
    return await ChimeNative.setAudioOutputDevice(deviceId);
  } catch (error) {
    console.error('Failed to set audio output device:', error);
    return false;
  }
};

/**
 * Starts the audio session for a voice call
 */
export const startAudioSession = async (): Promise<boolean> => {
  try {
    return await ChimeNative.startAudioSession();
  } catch (error) {
    console.error('Failed to start audio session:', error);
    return false;
  }
};

/**
 * Stops the audio session
 */
export const stopAudioSession = async (): Promise<boolean> => {
  try {
    return await ChimeNative.stopAudioSession();
  } catch (error) {
    console.error('Failed to stop audio session:', error);
    return false;
  }
};

/**
 * Unlocks audio focus (needed for some devices, especially iOS)
 */
export const unlockAudioFocus = async (): Promise<boolean> => {
  try {
    return await ChimeNative.unlockAudioFocus();
  } catch (error) {
    console.error('Failed to unlock audio focus:', error);
    return false;
  }
};

/**
 * Gets the default speaker device for the current platform
 */
export const getDefaultSpeakerDevice = (): string => {
  return Platform.OS === 'ios' ? 'speaker' : 'speaker';
};

/**
 * Gets the default microphone device for the current platform
 */
export const getDefaultMicrophoneDevice = (): string => {
  // For iOS, we don't expose individual mic devices
  // For Android, we typically use the first available device
  return Platform.OS === 'ios' ? 'default' : 'default';
};

/**
 * Checks if the device supports bluetooth audio devices
 */
export const supportsBluetoothAudio = async (): Promise<boolean> => {
  try {
    const { outputDevices } = await listAudioDevices();
    return outputDevices.some(device => device.deviceId === 'bluetooth');
  } catch (error) {
    console.error('Failed to check bluetooth audio support:', error);
    return false;
  }
};

/**
 * Formats an audio device name for display
 */
export const formatDeviceName = (device: AudioDevice): string => {
  // Clean up device names for better display
  let name = device.label;
  
  if (name.includes('Default')) {
    return 'Default Device';
  }
  
  if (name.includes('Bluetooth') || name === 'bluetooth') {
    return 'Bluetooth Headset';
  }
  
  if (name === 'speaker') {
    return 'Speaker';
  }
  
  if (name === 'receiver' || name === 'earpiece') {
    return 'Earpiece';
  }
  
  if (name === 'wired' || name.includes('Wired')) {
    return 'Wired Headset';
  }
  
  return name;
};
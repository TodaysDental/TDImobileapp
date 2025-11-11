export * from './api';
export * from './chime';

// Additional types specific to React Native implementation
export interface Device {
  deviceId: string;
  label: string;
}

// Common types across the call center application
export type AgentStatus = 
  | 'Offline'
  | 'Connecting'
  | 'Online'
  | 'Ringing'
  | 'In Call'
  | 'After Call Work'
  | 'Away'
  | 'Error';

export interface CallSession {
  callId: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  status: 'ringing' | 'connected' | 'ended';
  startTime?: number;
  endTime?: number;
}

export interface IncomingCall {
  callId: string;
  from: string;
}
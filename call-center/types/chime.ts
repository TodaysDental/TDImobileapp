// Amazon Chime SDK Meeting info types
export interface ChimeMeetingInfo {
  MeetingId: string;
  MediaRegion: string;
  MediaPlacement: {
    AudioHostUrl: string;
    SignalingUrl: string;
    TurnControlUrl: string;
  };
}

export interface ChimeAttendeeInfo {
  AttendeeId: string;
  JoinToken: string;
}

// Audio device types
export interface AudioDevice {
  deviceId: string;
  label: string;
}

// Meeting session types
export interface MeetingSession {
  audioVideo: AudioVideoFacade;
}

export interface AudioVideoFacade {
  start(): Promise<void>;
  stop(): Promise<void>;
  realtimeLocalMute(): Promise<void>;
  realtimeLocalUnmute(): Promise<void>;
  realtimeIsLocalAudioMuted(): boolean;
  listAudioDevices(): Promise<{
    inputDevices: AudioDevice[];
    outputDevices: AudioDevice[];
  }>;
  chooseAudioInputDevice(deviceId: string): Promise<void>;
  chooseAudioOutputDevice(deviceId: string): Promise<void>;
}

// Call and agent types
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

// Event types
export interface MeetingStartEvent {
  meetingId: string;
}

export interface MeetingEndEvent {
  meetingId: string;
}

export interface AttendeeEvent {
  attendeeId: string;
  externalUserId?: string;
}

export interface AudioStatusChangedEvent {
  muted: boolean;
}

export interface DeviceChangedEvent {
  inputDevice?: string;
  outputDevice?: string;
}

export interface ErrorEvent {
  errorCode: string;
  errorMessage: string;
}
// API Response Types
export interface InitiateCallResponse {
  callId: string;
  message: string;
  success: boolean;
}

export interface CallStatusResponse {
  callId: string;
  status: CallStatus;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  startTime?: number;
  endTime?: number;
  duration?: number;
}

export interface AgentStatusResponse {
  agentId: string;
  status: AgentStatus;
  clinicIds: string[];
  currentCallId?: string;
  lastActivityTime?: number;
}

export interface ClinicInfo {
  clinicId: string;
  name: string;
  phoneNumber?: string;
  roles: string[];
}

export interface StartSessionResponse {
  meeting: {
    MeetingId: string;
    MediaRegion: string;
    MediaPlacement: {
      AudioHostUrl: string;
      SignalingUrl: string;
      TurnControlUrl: string;
    };
  };
  attendee: {
    AttendeeId: string;
    JoinToken: string;
  };
}

// API Request Types
export interface RequestOtpPayload {
  phoneNumber: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otp: string;
}

export interface NotifyCallAcceptedPayload {
  callId: string;
  agentId: string;
}

export interface NotifyCallRejectedPayload {
  callId: string;
  agentId: string;
  reason?: string;
}

export interface NotifyCallHungUpPayload {
  callId: string;
  agentId: string;
  duration: number;
  reason?: string;
}

export interface OutboundCallPayload {
  toPhoneNumber: string;
  fromClinicId: string;
}

export interface TransferCallPayload {
  callId: string;
  fromAgentId: string;
  toAgentId: string;
}

// Enums
export enum CallStatus {
  RINGING = 'ringing',
  CONNECTED = 'connected',
  ENDED = 'ended',
  MISSED = 'missed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

export enum AgentStatus {
  OFFLINE = 'Offline',
  CONNECTING = 'Connecting',
  ONLINE = 'Online',
  RINGING = 'Ringing',
  IN_CALL = 'In Call',
  AFTER_CALL_WORK = 'After Call Work',
  AWAY = 'Away',
  ERROR = 'Error',
}
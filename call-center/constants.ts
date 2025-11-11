// Agent Status Constants
export const AGENT_STATUS = {
  OFFLINE: 'Offline',
  CONNECTING: 'Connecting',
  ONLINE: 'Online',
  RINGING: 'Ringing',
  IN_CALL: 'In Call',
  AFTER_CALL_WORK: 'After Call Work',
  AWAY: 'Away',
  ERROR: 'Error',
};

// API Endpoints
export const API_ENDPOINTS = {
  START_SESSION: '/agent/session/start',
  STOP_SESSION: '/agent/session/stop',
  AGENT_STATUS: '/agent/status',
  OUTBOUND_CALL: '/call/outbound',
  ACCEPT_CALL: '/call/accept',
  REJECT_CALL: '/call/reject',
  HANG_UP_CALL: '/call/hangup',
  TRANSFER_CALL: '/call/transfer',
};

// Polling intervals (in milliseconds)
export const POLLING = {
  AGENT_STATUS: 5000,      // 5 seconds
  CALL_STATUS: 2000,       // 2 seconds
  OUTBOUND_STATUS: 1000,   // 1 second
  CONNECTION_TIMEOUT: 30000, // 30 seconds
};

// Call statuses
export const CALL_STATUS = {
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  MISSED: 'missed',
  REJECTED: 'rejected',
  FAILED: 'failed',
};

// Call directions
export const CALL_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

// Audio device types
export const AUDIO_DEVICE = {
  // Common device types across platforms
  SPEAKER: 'speaker',
  RECEIVER: 'receiver',
  BLUETOOTH: 'bluetooth',
  WIRED: 'wired',
  
  // Platform-specific (for iOS)
  IOS_SPEAKER: 'speaker',
  IOS_RECEIVER: 'receiver',
  IOS_BLUETOOTH: 'bluetooth',
  IOS_WIRED: 'wired',
  
  // Platform-specific (for Android)
  ANDROID_SPEAKER: 'speaker',
  ANDROID_EARPIECE: 'earpiece',
  ANDROID_BLUETOOTH: 'bluetooth',
  ANDROID_WIRED_HEADSET: 'wired',
};

// Permission types
export const PERMISSION = {
  MICROPHONE: 'microphone',
  BLUETOOTH: 'bluetooth',
  NOTIFICATIONS: 'notifications',
};

// Audio session modes
export const AUDIO_SESSION = {
  VOICE_CHAT: 'voiceChat',
  VIDEO_CHAT: 'videoChat',
  MEASUREMENT: 'measurement',
  PLAY_AND_RECORD: 'playAndRecord',
  PLAY_ONLY: 'playOnly',
};
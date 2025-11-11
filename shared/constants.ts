// API Configuration - Production only
// Protected API is mapped under /api, while auth lives under /auth
export const API_BASE_URL = 'https://api.todaysdentalinsights.com/api';
export const AUTH_BASE_URL = 'https://api.todaysdentalinsights.com/auth';
export const OPENDENTAL_API_BASE_URL = 'https://api.todaysdentalinsights.com/opendental/api';
export const TEMPLATES_API_BASE_URL = 'https://api.todaysdentalinsights.com/templates/templates';
export const QUERIES_API_BASE_URL = 'https://api.todaysdentalinsights.com/queries/queries';
export const NOTIFICATIONS_API_BASE_URL = 'https://api.todaysdentalinsights.com/notifications/notifications';
export const WEBSOCKET_URL = 'wss://l57gfwfpqb.execute-api.us-east-1.amazonaws.com/prod';
export const REGISTER_BASE_URL = 'https://api.todaysdentalinsights.com/admin';
export const HR_API_BASE_URL = 'https://api.todaysdentalinsights.com/hr';
// Voice Stack API Configuration
export const VOICE_STACK_BASE_URL = 'https://api.todaysdentalinsights.com';
export const VOICE_STACK_WEBSOCKET_URL = 'wss://api.todaysdentalinsights.com/prod';

// Voice Stack API Endpoints
export const VOICE_STACK_ENDPOINTS = {
  // Voice Service Base Path: /voice/
  VOICE: {
    // Agent Management
    AGENT_LOGIN: '/voice/agent/login',
    AGENT_LOGOUT: '/voice/agent/logout',
    AGENT_STATE: '/voice/agent/state',
    AGENT_STATUS: '/voice/agent/status',
    AGENTS_LIST: '/voice/agents',

    // Queue Management
    QUEUE_ASSIGN: '/voice/queue/assign',
    QUEUE_STATUS: '/voice/queue/status',

    // Call Management
    HEARTBEAT: '/voice/agent/heartbeat',
    OUTBOUND_CALL: '/voice/call/outbound',
    INBOUND_CALL: '/voice/call/inbound',
    ANSWER_CALL: '/voice/call/answer',
    DECLINE_CALL: '/voice/call/decline',
    END_CALL: '/voice/call/end',
    ACTIVE_CALLS: '/voice/call/active',
  },

  // Call Center Service Base Path: /call-center/
  CALL_CENTER: {
    // Dashboard and Analytics
    DASHBOARD: '/call-center/dashboard',
    STATISTICS: '/call-center/statistics',
    AGENTS_STATUS: '/call-center/agents/status',
    HISTORY: '/call-center/history',
    PERFORMANCE: '/call-center/performance',
    QUEUE_SUMMARY: '/call-center/queue/summary',

    // Call Operations
    TRANSFER: '/call-center/transfer',
    RECORDINGS: '/call-center/recordings',
    TRACK: '/call-center/track',
  },

  // Callback Service Base Path: /callback/
  CALLBACK: {
    BASE: '/callback/',
  },
} as const;

// Application configuration
export const APP_CONFIG = {
  APP_NAME: 'Today\'s Dental Insights',
  VERSION: '1.0.0',
  
  // Authentication settings
  AUTH: {
    TOKEN_STORAGE_KEY: 'authToken',
    ID_TOKEN_KEY: 'idToken',
    ACCESS_TOKEN_KEY: 'accessToken',
    REFRESH_TOKEN_KEY: 'refreshToken',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  
  // API settings
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // UI settings
  UI: {
    THEME: 'light',
    SIDEBAR_COLLAPSED: false,
    ITEMS_PER_PAGE: 25,
    TOAST_DURATION: 5000, // 5 seconds
  },
  
  // React Native specific settings
  NATIVE: {
    ANIMATION_DURATION: 300,
    HAPTIC_FEEDBACK_ENABLED: true,
    BIOMETRICS_ENABLED: false,
    DEEP_LINKING_PREFIX: 'tdsapp://',
    KEYBOARD_OFFSET: 80,
  },
};

// URL helpers
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
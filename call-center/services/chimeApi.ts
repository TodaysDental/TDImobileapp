import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants';
import { 
  InitiateCallResponse, 
  NotifyCallAcceptedPayload,
  NotifyCallRejectedPayload,
  NotifyCallHungUpPayload,
  OutboundCallPayload,
  TransferCallPayload,
  StartSessionResponse
} from '../types';

class ChimeApiService {
  private http: AxiosInstance;
  private authToken: string | null = null;
  private baseURL: string = 'https://api.todaysdentalinsights.com/voice';

  constructor() {
    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set up request interceptor to add auth token
    this.http.interceptors.request.use(
      async (config) => {
        if (this.authToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Initialize auth token from AsyncStorage
    this.initAuthToken();
  }

  private async initAuthToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        this.authToken = JSON.parse(token);
      }
    } catch (error) {
      console.error('[ChimeApi] Failed to initialize auth token:', error);
    }
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Start a session for an agent
  public async startSession(clinicIds: string[]): Promise<StartSessionResponse> {
    const { data } = await this.http.post(API_ENDPOINTS.START_SESSION, { clinicIds });
    return data;
  }

  // Stop an agent's session
  public async stopSession(): Promise<boolean> {
    const { data } = await this.http.post(API_ENDPOINTS.STOP_SESSION);
    return data.success;
  }

  // Make an outbound call
  public async outboundCall(payload: OutboundCallPayload): Promise<InitiateCallResponse> {
    const { data } = await this.http.post(API_ENDPOINTS.OUTBOUND_CALL, payload);
    return data;
  }

  // Notify that a call was accepted
  public async notifyCallAccepted(payload: NotifyCallAcceptedPayload): Promise<boolean> {
    const { data } = await this.http.post(API_ENDPOINTS.ACCEPT_CALL, payload);
    return data.success;
  }

  // Notify that a call was rejected
  public async notifyCallRejected(payload: NotifyCallRejectedPayload): Promise<boolean> {
    const { data } = await this.http.post(API_ENDPOINTS.REJECT_CALL, payload);
    return data.success;
  }

  // Notify that a call was hung up
  public async notifyCallHungUp(payload: NotifyCallHungUpPayload): Promise<boolean> {
    const { data } = await this.http.post(API_ENDPOINTS.HANG_UP_CALL, payload);
    return data.success;
  }

  // Transfer a call to another agent
  public async transferCall(payload: TransferCallPayload): Promise<boolean> {
    const { data } = await this.http.post(API_ENDPOINTS.TRANSFER_CALL, payload);
    return data.success;
  }

  // Poll for agent status
  public async pollAgentStatus(agentId: string): Promise<any> {
    const { data } = await this.http.get(`${API_ENDPOINTS.AGENT_STATUS}/${agentId}`);
    return data;
  }
}

export const chimeApi = new ChimeApiService();
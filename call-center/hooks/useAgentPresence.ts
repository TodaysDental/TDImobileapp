import { useState, useEffect, useCallback, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { authTokenAtom } from '../../login/store/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chimeApi } from '../services/chimeApi';
import { AGENT_STATUS, POLLING } from '../constants';
import { IncomingCall, AgentStatusResponse } from '../types';
import { Alert } from 'react-native';
import { Buffer } from 'buffer';

interface AgentPresence {
  agentStatus: string;
  setAgentStatus: React.Dispatch<React.SetStateAction<string>>;
  incomingCall: IncomingCall | null;
  clearIncomingCall: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export function useAgentPresence(): AgentPresence {
  const jotaiToken = useAtomValue(authTokenAtom);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string>(AGENT_STATUS.OFFLINE);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  
  // Ref for the stopPolling function to avoid circular dependencies
  const stopPollingRef = useRef<() => void>(() => {
    if (!isPollingRef.current) return;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    isPollingRef.current = false;
    console.log('[AgentPresence] Stopped polling.');
  });

  // Clear incoming call
  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // Load token from AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = jotaiToken || await AsyncStorage.getItem('authToken');
        if (storedToken) {
          const tokenValue = typeof storedToken === 'string' ? JSON.parse(storedToken) : storedToken;
          setToken(tokenValue);
          
          // Extract user ID from token
          try {
            const parts = tokenValue.split('.');
            if (parts.length === 3) {
              // Use Buffer for base64 decoding instead of atob
              const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
              if (payload.sub) {
                setUserId(payload.sub);
              }
            }
          } catch (e) {
            console.error('[AgentPresence] Failed to parse token payload:', e);
          }
        } else {
          setToken(null);
          setUserId(null);
        }
      } catch (error) {
        console.error('[AgentPresence] Failed to load token:', error);
        setToken(null);
        setUserId(null);
      }
    };
    
    loadToken();
  }, [jotaiToken]);
  
  // Poll for agent status
  const pollAgentStatus = useCallback(async () => {
    if (!userId || !token || agentStatus === AGENT_STATUS.OFFLINE) {
      return;
    }
    
    try {
      const response: AgentStatusResponse = await chimeApi.pollAgentStatus(userId);
      
      // Check if there's an incoming call
      if (response.status === 'Ringing' && response.currentCallId && agentStatus !== AGENT_STATUS.RINGING) {
        // Extract call details from the response
        const incomingCallDetails: IncomingCall = {
          callId: response.currentCallId,
          // Use fallback value for from field if it doesn't exist
          from: (response as any).from || 'Unknown',
        };
        
        setIncomingCall(incomingCallDetails);
        setAgentStatus(AGENT_STATUS.RINGING);
        stopPollingRef.current(); // Use the ref function
        
        // Alert user of incoming call
        Alert.alert('Incoming Call', `Call from ${incomingCallDetails.from}`, 
          [
            { text: 'Decline', onPress: () => console.log('Decline pressed') },
            { text: 'Accept', onPress: () => console.log('Accept pressed') }
          ],
          { cancelable: false }
        );
      } 
      // Update agent status if changed
      else if (response.status && response.status !== agentStatus) {
        setAgentStatus(response.status);
      }
    } catch (error) {
      console.error('[AgentPresence] Failed to poll agent status:', error);
      // If we get an error, don't change status unless offline
      if (agentStatus !== AGENT_STATUS.OFFLINE) {
        console.warn('[AgentPresence] Setting status to ERROR due to polling failure');
        setAgentStatus(AGENT_STATUS.ERROR);
      }
    }
  }, [userId, token, agentStatus]);

  // Start polling for agent status
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    console.log('[AgentPresence] Starting polling...');
    
    // Poll immediately
    pollAgentStatus();
    
    // Set up interval
    pollingIntervalRef.current = setInterval(pollAgentStatus, POLLING.AGENT_STATUS);
  }, [pollAgentStatus]);

  // Stop polling for agent status - create the actual function
  const stopPolling = useCallback(() => {
    stopPollingRef.current();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    agentStatus,
    setAgentStatus,
    incomingCall,
    clearIncomingCall,
    startPolling,
    stopPolling,
  };
}
/**
 * SynapseOS Mobile — NetworkContext
 * Monitors backend connectivity, server readiness, and allows dynamic host URL switching.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ApiEndpoints, HealthReadyResponse } from '../api/endpoints';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_API_BASE_URL } from '../api/client';
import { SecureStorage } from '../storage/secureStorage';

interface NetworkContextType {
  isOnline: boolean;
  apiHost: string;
  updateApiHost: (newHost: string) => Promise<void>;
  resetApiHost: () => Promise<void>;
  readiness: HealthReadyResponse | null;
  checking: boolean;
  refreshConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [apiHost, setApiHostState] = useState<string>(getApiBaseUrl());
  const [readiness, setReadiness] = useState<HealthReadyResponse | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  const refreshConnection = useCallback(async () => {
    setChecking(true);
    try {
      const data = await ApiEndpoints.getHealthReadiness();
      setReadiness(data);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
      setReadiness(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    SecureStorage.getCustomApiHost(DEFAULT_API_BASE_URL).then(savedHost => {
      setApiHostState(savedHost);
      setApiBaseUrl(savedHost);
      refreshConnection();
    });
  }, [refreshConnection]);

  const updateApiHost = async (newHost: string) => {
    setApiHostState(newHost);
    setApiBaseUrl(newHost);
    await refreshConnection();
  };

  const resetApiHost = async () => {
    await updateApiHost(DEFAULT_API_BASE_URL);
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        apiHost,
        updateApiHost,
        resetApiHost,
        readiness,
        checking,
        refreshConnection
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

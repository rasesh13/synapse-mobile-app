/**
 * SynapseOS Mobile — Typed API Client
 * Features: Request timeout (15s), cancellation, retry, and normalized error handling.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { SecureStorage } from '../storage/secureStorage';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  isNetworkError: boolean;
}

// Live Public Cloud HTTPS backend deployment
export const DEFAULT_API_BASE_URL = 'https://ethical-skills-golf-answering.trycloudflare.com';

let currentBaseUrl = DEFAULT_API_BASE_URL;

// Initialize base URL from storage
SecureStorage.getCustomApiHost(DEFAULT_API_BASE_URL).then(host => {
  currentBaseUrl = host;
});

export const apiClient: AxiosInstance = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor ensuring dynamic base URL is always current
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = currentBaseUrl;
  return config;
});

// Response interceptor with retry mechanism for transient network dropouts
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    
    // Retry once for transient 502/503/504 or network timeout on safe idempotent requests
    if (config && (!config._retryCount || config._retryCount < 1)) {
      config._retryCount = (config._retryCount || 0) + 1;
      const isTransient = error.code === 'ECONNABORTED' || !error.response || (error.response.status >= 502 && error.response.status <= 504);
      if (isTransient && (config.method === 'get' || config.method === 'GET')) {
        await new Promise(res => setTimeout(res, 1000));
        return apiClient(config);
      }
    }
    return Promise.reject(normalizeError(error));
  }
);

export function setApiBaseUrl(newUrl: string): void {
  const trimmed = newUrl.replace(/\/+$/, '');
  currentBaseUrl = trimmed;
  apiClient.defaults.baseURL = trimmed;
  SecureStorage.setCustomApiHost(trimmed);
}

export function getApiBaseUrl(): string {
  return currentBaseUrl;
}

export function normalizeError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<any>;
    if (!axiosErr.response) {
      return {
        message: 'Cannot connect to Synapse-OS server. Check internet or server status.',
        code: axiosErr.code || 'NETWORK_ERROR',
        isNetworkError: true
      };
    }
    const data = axiosErr.response.data;
    const detail = data?.detail || data?.message || axiosErr.message || 'An unexpected error occurred.';
    return {
      message: typeof detail === 'string' ? detail : JSON.stringify(detail),
      code: `HTTP_${axiosErr.response.status}`,
      status: axiosErr.response.status,
      isNetworkError: false
    };
  }
  return {
    message: error?.message || 'An unknown error occurred.',
    isNetworkError: false
  };
}

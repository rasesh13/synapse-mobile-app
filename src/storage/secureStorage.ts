/**
 * SynapseOS Mobile — Secure Storage & Local State Persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode } from '../types';

const KEYS = {
  LANGUAGE: '@synapse_user_language',
  PROFILE_ID: '@synapse_active_profile_id',
  CHAT_HISTORY: '@synapse_chat_history_v2',
  RECORDS_CACHE: '@synapse_records_cache_v2',
  CUSTOM_API_HOST: '@synapse_custom_api_host'
};

export const SecureStorage = {
  // 1. Language Preference
  async getLanguage(): Promise<LanguageCode> {
    try {
      const val = await AsyncStorage.getItem(KEYS.LANGUAGE);
      return (val as LanguageCode) || 'en';
    } catch {
      return 'en';
    }
  },

  async setLanguage(lang: LanguageCode): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Failed to save language:', e);
    }
  },

  // 2. Active Patient Profile
  async getActiveProfileId(defaultId: string = 'mausam_kar_verified_abha'): Promise<string> {
    try {
      const val = await AsyncStorage.getItem(KEYS.PROFILE_ID);
      return val || defaultId;
    } catch {
      return defaultId;
    }
  },

  async setActiveProfileId(profileId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE_ID, profileId);
    } catch (e) {
      console.warn('Failed to save profile ID:', e);
    }
  },

  // 3. Chat History
  async getChatHistory(): Promise<any[]> {
    try {
      const val = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  async saveChatHistory(history: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history.slice(-30))); // Keep last 30 messages
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  },

  async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.CHAT_HISTORY);
    } catch (e) {
      console.warn('Failed to clear chat history:', e);
    }
  },

  // 4. Cached Records
  async getCachedRecords(): Promise<any[]> {
    try {
      const val = await AsyncStorage.getItem(KEYS.RECORDS_CACHE);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  async saveCachedRecords(records: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.RECORDS_CACHE, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save records cache:', e);
    }
  },

  // 5. Configurable API Host
  async getCustomApiHost(defaultHost: string = 'http://10.0.2.2:8000'): Promise<string> {
    try {
      const val = await AsyncStorage.getItem(KEYS.CUSTOM_API_HOST);
      return val || defaultHost;
    } catch {
      return defaultHost;
    }
  },

  async setCustomApiHost(host: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CUSTOM_API_HOST, host);
    } catch (e) {
      console.warn('Failed to save custom API host:', e);
    }
  }
};

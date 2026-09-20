/**
 * SynapseOS Mobile — Typed API Endpoints
 * Maps directly to FastAPI backend routes in backend/app/api/endpoints.py
 */

import { apiClient } from './client';
import { BlockchainRecord, VerificationResult } from '../types';

export interface MobileConfig {
  version: string;
  environment: string;
  demo_mode: boolean;
  features: {
    ai_chat: boolean;
    voice_agent: boolean;
    abha_sandbox: boolean;
    blockchain_records: boolean;
    whatsapp_simulator: boolean;
    offline_mode: boolean;
    emergency_sos: boolean;
  };
  vapi: {
    public_key: string;
    assistant_id: string;
  };
  whatsapp: {
    business_phone: string;
    clean_phone: string;
    deep_link: string;
    is_live: boolean;
  };
  blockchain: {
    network: string;
    contract_address: string;
    is_live: boolean;
  };
  emergency_numbers: {
    ambulance: string;
    national_emergency: string;
    tele_manas: string;
    women_helpline: string;
  };
  supported_languages: Array<{
    code: string;
    name: string;
    nativeName: string;
    flag: string;
  }>;
}

export interface HealthReadyResponse {
  status: string;
  timestamp: string;
  subsystems: {
    api_gateway: string;
    llm_reasoning: string;
    whatsapp_service: string;
    ipfs_storage: string;
    blockchain_registry: string;
    abdm_sandbox: string;
  };
  mode: string;
}

export interface OrchestrateResponse {
  session_id: string;
  user_id: string;
  channel: string;
  input_text: string;
  language: string;
  detected_intent?: string;
  safety_cleared: boolean;
  safety_message?: string;
  final_response: string;
  trace: Array<{
    agent_name: string;
    action: string;
    duration_ms: number;
    details?: Record<string, any>;
  }>;
  council_consensus?: {
    percentage: number;
    status: string;
  };
}

export interface AbhaGenerateResponse {
  abha_number: string;
  abha_address: string;
  name: string;
  year_of_birth: number;
  gender?: string;
  state_code: string;
  pm_jay_eligible: boolean;
  pm_jay_coverage_limit: string;
  linked_hip: string;
  is_sandbox: boolean;
}

export interface WhatsAppSimulateResponse {
  status: string;
  response: string;
  user_message: string;
  language: string;
  sender: string;
  is_plain_text: boolean;
}

export const ApiEndpoints = {
  // 1. Mobile Config & Readiness
  async getMobileConfig(): Promise<MobileConfig> {
    const res = await apiClient.get<MobileConfig>('/api/mobile/config');
    return res.data;
  },

  async getHealthReadiness(): Promise<HealthReadyResponse> {
    const res = await apiClient.get<HealthReadyResponse>('/api/health/ready');
    return res.data;
  },

  // 2. AI Multi-Agent Orchestration
  async orchestrateHealth(
    message: string,
    sessionId: string,
    userId: string,
    language: string
  ): Promise<OrchestrateResponse> {
    const res = await apiClient.post<OrchestrateResponse>('/api/orchestrate', {
      message,
      channel: 'mobile',
      session_id: sessionId,
      user_id: userId,
      language
    });
    return res.data;
  },

  // 3. ABDM Sandbox Health ID
  async generateAbhaId(
    name: string,
    yearOfBirth: number,
    stateCode: string = 'DL'
  ): Promise<AbhaGenerateResponse> {
    const res = await apiClient.get<AbhaGenerateResponse>('/api/abdm/generate-id', {
      params: { name, year_of_birth: yearOfBirth, state_code: stateCode }
    });
    return res.data;
  },

  async getAbdmSchemes(condition: string = 'general'): Promise<any> {
    const res = await apiClient.get('/api/abdm/schemes', {
      params: { condition }
    });
    return res.data;
  },

  // 4. Clinical PDF Health Passport
  async generatePdfPassport(payload: {
    patient_name: string;
    abha_id: string;
    triage_summary: string;
    vital_signs?: Record<string, string>;
    medications?: Array<Record<string, string>>;
  }): Promise<Blob> {
    const res = await apiClient.post('/api/reports/generate-pdf', payload, {
      responseType: 'blob'
    });
    return res.data;
  },

  // 5. Blockchain & IPFS Records
  async registerRecord(payload: {
    patient_name: string;
    abha_number: string;
    record_type: string;
    clinical_summary: string;
    facility?: string;
    profile_id?: string;
  }): Promise<BlockchainRecord> {
    const res = await apiClient.post<BlockchainRecord>('/api/records/register', payload);
    return res.data;
  },

  async listRecords(abhaNumber?: string, profileId?: string): Promise<BlockchainRecord[]> {
    const res = await apiClient.get<BlockchainRecord[]>('/api/records/list', {
      params: { abha_number: abhaNumber, profile_id: profileId }
    });
    return res.data;
  },

  async verifyRecord(recordId: string): Promise<VerificationResult> {
    const res = await apiClient.get<VerificationResult>(`/api/records/verify/${encodeURIComponent(recordId)}`);
    return res.data;
  },

  // 6. Emergency SOS Dispatch
  async dispatchEmergencySos(payload: {
    patient_name: string;
    emergency_contact: string;
    location_coords: string;
    blood_group: string;
    critical_symptoms: string;
  }): Promise<any> {
    const res = await apiClient.post('/api/sos/dispatch', payload);
    return res.data;
  },

  // 7. WhatsApp Simulation
  async simulateWhatsApp(
    message: string,
    language: string = 'en',
    phone: string = '+919876543210'
  ): Promise<WhatsAppSimulateResponse> {
    const res = await apiClient.post<WhatsAppSimulateResponse>('/api/whatsapp/simulate', {
      From: phone,
      Body: message,
      language
    });
    return res.data;
  }
};

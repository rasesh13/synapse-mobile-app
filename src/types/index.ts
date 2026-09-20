/**
 * SynapseOS Mobile — Core TypeScript Data Types & Schemas
 */

export type LanguageCode =
  | 'en' // English
  | 'hi' // हिन्दी (Hindi)
  | 'bn' // বাংলা (Bengali)
  | 'ta' // தமிழ் (Tamil)
  | 'te' // తెలుగు (Telugu)
  | 'mr' // मराठी (Marathi)
  | 'gu' // ગુજરાતી (Gujarati)
  | 'kn' // ಕನ್ನಡ (Kannada)
  | 'ml' // മലയാളം (Malayalam)
  | 'pa' // ਪੰਜਾਬੀ (Punjabi)
  | 'or'; // ଓଡ଼ିଆ (Odia)

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐', region: 'Global' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'North / Central' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'West Bengal' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Tamil Nadu' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Andhra / Telangana' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'Maharashtra' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'Kerala' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'Punjab' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', region: 'Odisha' },
];

export interface PatientProfile {
  profileId: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  yearOfBirth: number;
  bloodType: string;
  abhaId: string;
  abhaAddress: string;
  policyNumber: string;
  linkedHip: string;
  stateCode: string;
  avatarImageKey: string;
  isSandbox?: boolean;
}

export interface AgentTraceStep {
  agent_name: string;
  action: string;
  duration_ms: number;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  safetyCleared?: boolean;
  detectedIntent?: string;
  trace?: AgentTraceStep[];
  isEmergency?: boolean;
  isError?: boolean;
  pending?: boolean;
}

export interface BlockchainRecord {
  id: string;
  record_id_hex?: string;
  profile_id: string;
  patient_name: string;
  abha_number: string;
  record_type: string;
  facility: string;
  cid: string;
  file_hash: string;
  tx_hash?: string;
  timestamp: string;
  verified: boolean;
  status: string;
  is_live: boolean;
  etherscan_url?: string;
}

export interface VerificationResult {
  verified: boolean;
  on_chain: boolean;
  network?: string;
  contract_address?: string;
  record_id: string;
  file_hash?: string;
  cid?: string;
  owner?: string;
  timestamp?: string | number;
  status: 'VERIFIED_ON_CHAIN' | 'VERIFIED_DEMO_SANDBOX' | 'NOT_FOUND';
  message: string;
  etherscan_url?: string;
}

export interface RuralTopic {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  category: string;
  steps: { title: string; detail: string }[];
  redFlag: string;
  scheme: string;
}

export type VoiceCallState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'muted'
  | 'ended';

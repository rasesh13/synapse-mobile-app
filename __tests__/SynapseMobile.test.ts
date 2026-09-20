import { SUPPORTED_LANGUAGES, LanguageCode } from '../src/types';
import { TRANSLATIONS } from '../src/i18n/translations';
import { MOCK_PATIENT_PROFILES, DEFAULT_PATIENT_PROFILE } from '../src/data/mockProfiles';
import { RURAL_HEALTH_TOPICS } from '../src/data/ruralTopics';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_API_BASE_URL } from '../src/api/client';

describe('SynapseOS Mobile — Core Logic & Domain Verification', () => {
  describe('1. Multilingual Support (11 Languages)', () => {
    it('supports exactly 11 Indian languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(11);
      const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
      expect(codes).toEqual([
        'en',
        'hi',
        'bn',
        'ta',
        'te',
        'mr',
        'gu',
        'kn',
        'ml',
        'pa',
        'or',
      ]);
    });

    it('contains all essential clinical translation keys in each language', () => {
      const requiredKeys = [
        'tab_home',
        'tab_chat',
        'tab_voice',
        'tab_records',
        'tab_whatsapp',
        'app_title',
        'app_subtitle',
        'sos_button',
        'action_symptoms',
        'action_drugs',
      ];

      for (const lang of SUPPORTED_LANGUAGES) {
        const dict = TRANSLATIONS[lang.code as LanguageCode];
        expect(dict).toBeDefined();
        for (const key of requiredKeys) {
          expect(dict[key]).toBeDefined();
          expect(dict[key].length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('2. Citizen Patient Profiles', () => {
    it('provides verified patient profiles including Mausam Kar default', () => {
      expect(MOCK_PATIENT_PROFILES.length).toBeGreaterThanOrEqual(6);
      expect(DEFAULT_PATIENT_PROFILE.profileId).toBe('mausam_kar_verified_abha');
      expect(DEFAULT_PATIENT_PROFILE.name).toBe('Mausam Kar');
      expect(DEFAULT_PATIENT_PROFILE.abhaId).toMatch(/^91-\d{4}-\d{4}-\d{4}$/);
      expect(DEFAULT_PATIENT_PROFILE.isSandbox).toBe(true);
    });

    it('ensures each profile has valid ABHA ID format and policy number', () => {
      for (const profile of MOCK_PATIENT_PROFILES) {
        expect(profile.name).toBeTruthy();
        expect(profile.abhaId).toMatch(/^91-\d{4}-\d{4}-\d{4}$/);
        expect(profile.abhaAddress).toContain('@abdm');
        expect(profile.policyNumber).toContain('PM-JAY');
        expect(profile.linkedHip).toBeTruthy();
      }
    });
  });

  describe('3. Offline Rural Health Action Guides', () => {
    it('contains comprehensive rural first-aid and prevention topics', () => {
      expect(RURAL_HEALTH_TOPICS.length).toBeGreaterThanOrEqual(4);
      const ids = RURAL_HEALTH_TOPICS.map((t) => t.id);
      expect(ids).toContain('ors');
      expect(ids).toContain('snakebite');
      expect(ids).toContain('anemia');
      expect(ids).toContain('water');
    });

    it('ensures every topic has actionable steps, emergency red flag, and government scheme', () => {
      for (const topic of RURAL_HEALTH_TOPICS) {
        expect(topic.steps.length).toBeGreaterThanOrEqual(3);
        expect(topic.redFlag).toBeTruthy();
        expect(topic.scheme).toBeTruthy();
      }
    });
  });

  describe('4. API Client Host Configuration', () => {
    it('defaults to live 24/7 Render cloud HTTPS URL', () => {
      expect(DEFAULT_API_BASE_URL).toBe('https://synapse-backend-32ye.onrender.com');
    });

    it('allows dynamic API host switching at runtime', () => {
      setApiBaseUrl('http://192.168.1.100:8000');
      expect(getApiBaseUrl()).toBe('http://192.168.1.100:8000');
      setApiBaseUrl(DEFAULT_API_BASE_URL);
      expect(getApiBaseUrl()).toBe(DEFAULT_API_BASE_URL);
    });
  });
});

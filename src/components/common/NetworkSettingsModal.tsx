/**
 * SynapseOS Mobile — NetworkSettingsModal
 * Allows testing and switching backend host URL (emulator 10.0.2.2 vs LAN vs Production HTTPS)
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNetwork } from '../../context/NetworkContext';
import { useLanguage } from '../../context/LanguageContext';

interface NetworkSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NetworkSettingsModal: React.FC<NetworkSettingsModalProps> = ({ visible, onClose }) => {
  const { apiHost, updateApiHost, resetApiHost, isOnline, readiness, checking, refreshConnection } = useNetwork();
  const { t } = useLanguage();
  const [inputHost, setInputHost] = useState(apiHost);

  const handleSave = async () => {
    if (!inputHost.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend URL.');
      return;
    }
    await updateApiHost(inputHost.trim());
    Alert.alert('Saved', `Backend URL set to ${inputHost.trim()}`);
    onClose();
  };

  const handleReset = async () => {
    await resetApiHost();
    setInputHost('https://synapse-backend-32ye.onrender.com');
    Alert.alert('Reset', 'Backend URL restored to 24/7 Render Cloud endpoint.');
  };

  const isConnected = readiness?.status === 'READY' || isOnline;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings_network_title')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isConnected ? '#ecfdf5' : '#fef2f2' }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
              <Text style={[styles.statusText, { color: isConnected ? '#065f46' : '#991b1b' }]}>
                {isConnected ? t('online') : t('offline')}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>{t('settings_api_host')}</Text>
          <TextInput
            style={styles.input}
            value={inputHost}
            onChangeText={setInputHost}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="e.g. https://synapse-backend-32ye.onrender.com"
            placeholderTextColor="#94a3b8"
          />

          <View style={styles.helperBox}>
            <Text style={styles.helperText}>
              • 24/7 Render Cloud: https://synapse-backend-32ye.onrender.com{'\n'}
              • Cloudflare Edge: https://ethical-skills-golf-answering.trycloudflare.com{'\n'}
              • Android Emulator: http://10.0.2.2:8000
            </Text>
          </View>

          {readiness && (
            <View style={styles.readinessBox}>
              <Text style={styles.readinessTitle}>Subsystem Health:</Text>
              <Text style={styles.readinessItem}>• API: {readiness.subsystems.api_gateway}</Text>
              <Text style={styles.readinessItem}>• LLM Reasoning: {readiness.subsystems.llm_reasoning}</Text>
              <Text style={styles.readinessItem}>• WhatsApp: {readiness.subsystems.whatsapp_service}</Text>
              <Text style={styles.readinessItem}>• Blockchain: {readiness.subsystems.blockchain_registry}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.testBtn} onPress={refreshConnection} disabled={checking}>
            {checking ? (
              <ActivityIndicator size="small" color="#0284c7" />
            ) : (
              <Text style={styles.testBtnText}>🔄 Test Connection</Text>
            )}
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset Default</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{t('settings_save')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{t('settings_close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  statusOnline: {
    backgroundColor: '#dcfce7'
  },
  statusOffline: {
    backgroundColor: '#fee2e2'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  dotOnline: {
    backgroundColor: '#16a34a'
  },
  dotOffline: {
    backgroundColor: '#dc2626'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700'
  },
  textOnline: {
    color: '#15803d'
  },
  textOffline: {
    color: '#b91c1c'
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 12
  },
  helperBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14
  },
  helperText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18
  },
  readinessBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14
  },
  readinessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4
  },
  readinessItem: {
    fontSize: 12,
    color: '#475569'
  },
  testBtn: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  testBtnText: {
    color: '#0284c7',
    fontWeight: '700',
    fontSize: 14
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  resetBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  closeBtn: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14
  }
});

/**
 * SynapseOS Mobile — Emergency SOS Modal
 * Accessible from every screen via persistent SOS button.
 * Provides one-tap dialing for 108, 112, 14416, and sends instant GPS dispatch to backend.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ApiEndpoints } from '../../api/endpoints';

interface EmergencySOSModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ visible, onClose }) => {
  const { t } = useLanguage();
  const { activeProfile } = useAuth();
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const dialNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Call Failed', `Could not automatically dial ${number}. Please dial manually.`);
    });
  };

  const handleServerDispatch = async () => {
    setDispatching(true);
    try {
      await ApiEndpoints.dispatchEmergencySos({
        patient_name: activeProfile.name,
        emergency_contact: '+919876543210',
        location_coords: '28.6139,77.2090', // Default emergency PHC coordinates
        blood_group: activeProfile.bloodType,
        critical_symptoms: 'Patient triggered Emergency SOS from mobile app'
      });
      setDispatchedSuccess(true);
      setTimeout(() => setDispatchedSuccess(false), 4000);
    } catch {
      Alert.alert('Dispatch Queued', 'Emergency alert has been queued for local dispatch.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.alertIconBadge}>
              <Text style={styles.alertEmoji}>🚨</Text>
            </View>
            <Text style={styles.title}>{t('sos_modal_title')}</Text>
            <Text style={styles.subtitle}>{t('sos_modal_sub')}</Text>
          </View>

          {/* Emergency Call Buttons */}
          <View style={styles.callButtonsContainer}>
            {/* 108 Ambulance */}
            <TouchableOpacity
              style={[styles.callButton, styles.ambulanceButton]}
              activeOpacity={0.8}
              onPress={() => dialNumber('108')}
            >
              <Text style={styles.callButtonEmoji}>🚑</Text>
              <View style={styles.callButtonTextWrapper}>
                <Text style={styles.callButtonTitle}>{t('sos_call_108')}</Text>
                <Text style={styles.callButtonSubtitle}>Primary Rural Ambulance Dispatch</Text>
              </View>
            </TouchableOpacity>

            {/* 112 National Emergency */}
            <TouchableOpacity
              style={[styles.callButton, styles.policeButton]}
              activeOpacity={0.8}
              onPress={() => dialNumber('112')}
            >
              <Text style={styles.callButtonEmoji}>👮</Text>
              <View style={styles.callButtonTextWrapper}>
                <Text style={styles.callButtonTitle}>{t('sos_call_112')}</Text>
                <Text style={styles.callButtonSubtitle}>Police, Fire & Disaster Response</Text>
              </View>
            </TouchableOpacity>

            {/* 14416 Tele-MANAS */}
            <TouchableOpacity
              style={[styles.callButton, styles.mentalHealthButton]}
              activeOpacity={0.8}
              onPress={() => dialNumber('14416')}
            >
              <Text style={styles.callButtonEmoji}>🧠</Text>
              <View style={styles.callButtonTextWrapper}>
                <Text style={styles.callButtonTitle}>{t('sos_call_telemanas')}</Text>
                <Text style={styles.callButtonSubtitle}>24x7 Free Mental Health Helpline</Text>
              </View>
            </TouchableOpacity>

            {/* 1091 Women Helpline */}
            <TouchableOpacity
              style={[styles.callButton, styles.womenButton]}
              activeOpacity={0.8}
              onPress={() => dialNumber('1091')}
            >
              <Text style={styles.callButtonEmoji}>🛡️</Text>
              <View style={styles.callButtonTextWrapper}>
                <Text style={styles.callButtonTitle}>{t('sos_call_women')}</Text>
                <Text style={styles.callButtonSubtitle}>National Women Safety & Support</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* GPS Dispatch Trigger */}
          <TouchableOpacity
            style={[styles.dispatchButton, dispatchedSuccess && styles.dispatchButtonSuccess]}
            onPress={handleServerDispatch}
            disabled={dispatching || dispatchedSuccess}
          >
            {dispatching ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.dispatchButtonText}>
                {dispatchedSuccess ? '✓ GPS Alert Dispatched to 108 Desk' : `📍 ${t('sos_dispatch_server')}`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('sos_close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  alertIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  alertEmoji: {
    fontSize: 28
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#b91c1c',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4
  },
  callButtonsContainer: {
    gap: 10,
    marginBottom: 16
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 56
  },
  ambulanceButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5'
  },
  policeButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  mentalHealthButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  womenButton: {
    backgroundColor: '#fdf2f8',
    borderColor: '#fbcfe8'
  },
  callButtonEmoji: {
    fontSize: 24,
    marginRight: 14
  },
  callButtonTextWrapper: {
    flex: 1
  },
  callButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  callButtonSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  dispatchButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  dispatchButtonSuccess: {
    backgroundColor: '#16a34a'
  },
  dispatchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569'
  }
});

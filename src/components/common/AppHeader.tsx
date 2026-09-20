import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { LanguagePickerModal } from './LanguagePickerModal';
import { NetworkSettingsModal } from './NetworkSettingsModal';
import { EmergencySOSModal } from './EmergencySOSModal';
import { PatientProfile } from '../../types';

export const AVATAR_MAP: Record<string, any> = {
  'mausam_kar.jpg': require('../../assets/images/mausam_kar.jpg'),
  'rachit_tiwari.jpg': require('../../assets/images/rachit_tiwari.jpg'),
  'mangal_singh.jpg': require('../../assets/images/mangal_singh.jpg'),
  'surabhi.jpg': require('../../assets/images/surabhi.jpg'),
  'shaikh_warsi.jpg': require('../../assets/images/shaikh_warsi.jpg'),
  'jiya_jaiswal.jpg': require('../../assets/images/jiya_jaiswal.jpg'),
};

interface AppHeaderProps {
  onNavigateToRecords?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onNavigateToRecords }) => {
  const { activeProfile, allProfiles, switchProfileById } = useAuth();
  const { currentLanguageInfo, t } = useLanguage();
  const { isOnline } = useNetwork();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const avatarSource =
    AVATAR_MAP[activeProfile.avatarImageKey] ||
    require('../../assets/images/synapseos_app_icon.png');

  return (
    <View style={styles.headerContainer}>
      {/* Indian Tricolor Accent Line */}
      <View style={styles.tricolorBar}>
        <View style={[styles.tricolorSegment, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.tricolorSegment, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.tricolorSegment, { backgroundColor: '#138808' }]} />
      </View>

      {/* Top row: Brand + Action Badges */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/images/synapseos_app_icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>SYNAPSE-OS</Text>
              <View style={styles.badgeLive}>
                <Text style={styles.badgeLiveText}>RURAL</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Swarm AI Clinical OS</Text>
          </View>
        </View>

        {/* Right side controls */}
        <View style={styles.controlsRow}>
          {/* Network Indicator Dot */}
          <TouchableOpacity
            style={styles.networkDotButton}
            onPress={() => setShowNetworkModal(true)}
            activeOpacity={0.7}
            accessibilityLabel="Network status"
          >
            <View
              style={[
                styles.networkDot,
                { backgroundColor: isOnline ? '#10b981' : '#ef4444' },
              ]}
            />
          </TouchableOpacity>

          {/* Language Selector Pill */}
          <TouchableOpacity
            style={styles.languagePill}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="Select language"
          >
            <Text style={styles.languagePillFlag}>{currentLanguageInfo.flag}</Text>
            <Text style={styles.languagePillText}>{currentLanguageInfo.nativeName}</Text>
          </TouchableOpacity>

          {/* SOS Emergency Trigger */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setShowSOSModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="Emergency SOS 108"
          >
            <Text style={styles.sosButtonText}>🚨 SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Citizen Profile Bar */}
      <TouchableOpacity
        style={styles.profileBar}
        onPress={() => setShowProfileSwitcher(true)}
        activeOpacity={0.85}
      >
        <View style={styles.avatarWrap}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.onlineBadge} />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.profileNameRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {activeProfile.name}
            </Text>
            <View style={styles.sandboxBadge}>
              <Text style={styles.sandboxBadgeText}>ABDM Verified</Text>
            </View>
          </View>
          <Text style={styles.profileAbha} numberOfLines={1}>
            ABHA: {activeProfile.abhaId} • Blood: {activeProfile.bloodType}
          </Text>
        </View>
        <View style={styles.switchPill}>
          <Text style={styles.switchText}>Switch ▾</Text>
        </View>
      </TouchableOpacity>

      {/* Modals */}
      <LanguagePickerModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <NetworkSettingsModal
        visible={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />

      <EmergencySOSModal
        visible={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />

      {/* Quick Profile Switcher Modal */}
      <Modal
        visible={showProfileSwitcher}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileSwitcher(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile_verified')}</Text>
              <TouchableOpacity
                onPress={() => setShowProfileSwitcher(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Select a verified citizen profile to test ABHA records and clinical context:
            </Text>

            <FlatList
              data={allProfiles}
              keyExtractor={(item) => item.profileId}
              renderItem={({ item }) => {
                const isSelected = item.profileId === activeProfile.profileId;
                const pic =
                  AVATAR_MAP[item.avatarImageKey] ||
                  require('../../assets/images/synapseos_app_icon.png');
                return (
                  <TouchableOpacity
                    style={[
                      styles.profileItem,
                      isSelected && styles.profileItemSelected,
                    ]}
                    onPress={async () => {
                      await switchProfileById(item.profileId);
                      setShowProfileSwitcher(false);
                      if (onNavigateToRecords) onNavigateToRecords();
                    }}
                  >
                    <Image source={pic} style={styles.itemAvatar} />
                    <View style={styles.itemInfo}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemTag}>
                          {item.gender}, {item.age}y
                        </Text>
                      </View>
                      <Text style={styles.itemAbha}>{item.abhaId}</Text>
                      <Text style={styles.itemHip} numberOfLines={1}>
                        🏥 {item.linkedHip}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkPill}>
                        <Text style={styles.checkText}>Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0c1322',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tricolorBar: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
    width: '100%',
  },
  tricolorSegment: {
    flex: 1,
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  badgeLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgeLiveText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkDotButton: {
    padding: 6,
  },
  networkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  languagePillFlag: {
    fontSize: 13,
  },
  languagePillText: {
    color: '#f1f5f9',
    fontSize: 11,
    fontWeight: '700',
  },
  sosButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ef4444',
    elevation: 4,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131d33',
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 3,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#10b981',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#131d33',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  sandboxBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  sandboxBadgeText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '800',
  },
  profileAbha: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  switchPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  switchText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 14,
  },
  closeBtn: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileItemSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  itemAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#334155',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemTag: {
    color: '#94a3b8',
    fontSize: 11,
  },
  itemAbha: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  itemHip: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  checkPill: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  checkText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});

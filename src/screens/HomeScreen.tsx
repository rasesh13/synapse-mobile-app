import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { AppHeader } from '../components/common/AppHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { RURAL_HEALTH_TOPICS } from '../data/ruralTopics';
import { RuralTopic } from '../types';
import { RuralTopicDetailModal } from './RuralTopicDetailModal';
import { EmergencySOSModal } from '../components/common/EmergencySOSModal';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { activeProfile } = useAuth();
  const { t } = useLanguage();

  const [selectedTopic, setSelectedTopic] = useState<RuralTopic | null>(null);
  const [showSOSModal, setShowSOSModal] = useState(false);

  const dialEmergency = (num: string) => {
    Linking.openURL(`tel:${num}`);
  };

  return (
    <View style={styles.screenContainer}>
      <AppHeader onNavigateToRecords={() => navigation.navigate('RecordsTab')} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency SOS Quick Dial Strip */}
        <View style={styles.emergencyStrip}>
          <View style={styles.emergencyLeft}>
            <View style={styles.sosBeaconDot} />
            <View style={styles.emergencyTextWrap}>
              <Text style={styles.emergencyTitle}>🚨 {t('emergency_sos')}</Text>
              <Text style={styles.emergencySub}>24/7 Ambulance & Police Dispatch</Text>
            </View>
          </View>
          <View style={styles.emergencyActions}>
            <TouchableOpacity
              style={styles.sosQuickBtn}
              onPress={() => dialEmergency('108')}
              activeOpacity={0.8}
            >
              <Text style={styles.sosQuickText}>📞 108</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sosMoreBtn}
              onPress={() => setShowSOSModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.sosMoreText}>SOS Alert</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ABHA Digital Health Card Quick Banner */}
        <TouchableOpacity
          style={styles.abhaBanner}
          onPress={() => navigation.navigate('RecordsTab')}
          activeOpacity={0.9}
        >
          {/* Top Indian Tricolor Micro-line */}
          <View style={styles.cardTricolor}>
            <View style={[styles.tricolorSlice, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.tricolorSlice, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.tricolorSlice, { backgroundColor: '#138808' }]} />
          </View>

          <View style={styles.abhaHeader}>
            <View style={styles.smartChip}>
              <View style={styles.smartChipLine} />
              <View style={styles.smartChipLine} />
            </View>
            <View style={styles.abhaBadge}>
              <Text style={styles.abhaBadgeText}>AYUSHMAN BHARAT • DIGITAL HEALTH ID</Text>
            </View>
            <Text style={styles.abhaGovText}>Govt of India 🇮🇳</Text>
          </View>

          <View style={styles.abhaBody}>
            <View style={styles.abhaDetails}>
              <Text style={styles.abhaName}>{activeProfile.name}</Text>
              <Text style={styles.abhaNumber}>{activeProfile.abhaId}</Text>
              <Text style={styles.abhaSub} numberOfLines={1}>
                {activeProfile.abhaAddress} • PM-JAY: {activeProfile.policyNumber}
              </Text>
              <Text style={styles.abhaHospital} numberOfLines={1}>
                🏥 {activeProfile.linkedHip}
              </Text>
            </View>
          </View>

          <View style={styles.abhaFooter}>
            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedCheck}>✓</Text>
              <Text style={styles.abhaFooterText}>Encrypted & Sepolia Verified</Text>
            </View>
            <Text style={styles.abhaViewLink}>View Passport →</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Action Grid */}
        <Text style={styles.sectionHeader}>{t('quick_actions')}</Text>
        <View style={styles.actionGrid}>
          {/* Action 1: Symptom Triage */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}
            onPress={() => navigation.navigate('ChatTab')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.actionIcon}>🩺</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{t('check_symptoms')}</Text>
              <Text style={styles.actionDesc}>Multi-Agent Swarm triage</Text>
            </View>
            <Text style={[styles.actionArrow, { color: '#10b981' }]}>→</Text>
          </TouchableOpacity>

          {/* Action 2: Voice Doctor */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: 'rgba(6, 182, 212, 0.4)' }]}
            onPress={() => navigation.navigate('VoiceTab')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Text style={styles.actionIcon}>🎙️</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{t('voice_consult')}</Text>
              <Text style={styles.actionDesc}>Live Vapi voice doctor</Text>
            </View>
            <Text style={[styles.actionArrow, { color: '#06b6d4' }]}>→</Text>
          </TouchableOpacity>

          {/* Action 3: Medicine Safety */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: 'rgba(245, 158, 11, 0.4)' }]}
            onPress={() =>
              navigation.navigate('ChatTab', {
                initialPrompt:
                  'Check safe dosage and Indian brand timings for Dolo 650, ORS, and Pan-40',
              })
            }
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.actionIcon}>💊</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{t('medicine_safety')}</Text>
              <Text style={styles.actionDesc}>Dosage & timing (India)</Text>
            </View>
            <Text style={[styles.actionArrow, { color: '#f59e0b' }]}>→</Text>
          </TouchableOpacity>

          {/* Action 4: Vaccination Schedule */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: 'rgba(139, 92, 246, 0.4)' }]}
            onPress={() =>
              navigation.navigate('ChatTab', {
                initialPrompt:
                  'Provide the Universal Immunization Programme (UIP) child vaccine schedule in India',
              })
            }
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Text style={styles.actionIcon}>💉</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{t('child_vaccines')}</Text>
              <Text style={styles.actionDesc}>National Immunization UIP</Text>
            </View>
            <Text style={[styles.actionArrow, { color: '#8b5cf6' }]}>→</Text>
          </TouchableOpacity>

          {/* Action 5: WhatsApp Clinical Bot */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: 'rgba(34, 197, 94, 0.4)' }]}
            onPress={() => navigation.navigate('WhatsAppTab')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Text style={styles.actionIcon}>💬</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{t('whatsapp_bot')}</Text>
              <Text style={styles.actionDesc}>Plain-text bot simulator</Text>
            </View>
            <Text style={[styles.actionArrow, { color: '#22c55e' }]}>→</Text>
          </TouchableOpacity>

          {/* Action 6: Blockchain Records */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: 'rgba(59, 130, 246, 0.4)' }]}
            onPress={() => navigation.navigate('RecordsTab')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={styles.actionIcon}>⛓️</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{t('verify_records')}</Text>
              <Text style={styles.actionDesc}>Sepolia & IPFS ledger</Text>
            </View>
            <Text style={[styles.actionArrow, { color: '#3b82f6' }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Rural Healthcare Action Guides */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Offline Healthcare Guides</Text>
          <Text style={styles.sectionHeaderSub}>Always Available</Text>
        </View>

        <View style={styles.topicsList}>
          {RURAL_HEALTH_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => setSelectedTopic(topic)}
              activeOpacity={0.85}
            >
              <Text style={styles.topicIcon}>{topic.icon}</Text>
              <View style={styles.topicBody}>
                <View style={styles.topicTitleRow}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <View style={styles.topicCategoryTag}>
                    <Text style={styles.topicCategoryText}>{topic.category}</Text>
                  </View>
                </View>
                <Text style={styles.topicPreview} numberOfLines={2}>
                  {topic.steps[0].detail}
                </Text>
                <Text style={styles.topicSchemeText} numberOfLines={1}>
                  🏛️ {topic.scheme}
                </Text>
              </View>
              <Text style={styles.topicArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Government Welfare Schemes & Helplines Card */}
        <View style={styles.welfareCard}>
          <Text style={styles.welfareTitle}>🏛️ National Rural Health Helplines</Text>
          <View style={styles.helplineRow}>
            <TouchableOpacity
              style={styles.helplinePill}
              onPress={() => dialEmergency('108')}
            >
              <Text style={styles.helplinePillNum}>108</Text>
              <Text style={styles.helplinePillName}>Ambulance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helplinePill}
              onPress={() => dialEmergency('112')}
            >
              <Text style={styles.helplinePillNum}>112</Text>
              <Text style={styles.helplinePillName}>All Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helplinePill}
              onPress={() => dialEmergency('14416')}
            >
              <Text style={styles.helplinePillNum}>14416</Text>
              <Text style={styles.helplinePillName}>Tele-MANAS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helplinePill}
              onPress={() => dialEmergency('1091')}
            >
              <Text style={styles.helplinePillNum}>1091</Text>
              <Text style={styles.helplinePillName}>Women Helpline</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.welfareCover}>
            Ayushman Bharat PM-JAY: ₹5,00,000 cashless secondary & tertiary hospital cover per family per year at empaneled public & private hospitals.
          </Text>
        </View>
      </ScrollView>

      {/* Offline Topic Modal */}
      <RuralTopicDetailModal
        topic={selectedTopic}
        visible={!!selectedTopic}
        onClose={() => setSelectedTopic(null)}
      />

      {/* Emergency Modal */}
      <EmergencySOSModal
        visible={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  emergencyStrip: {
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  sosBeaconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#fee2e2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  emergencySub: {
    color: '#fca5a5',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  emergencyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosQuickBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 3,
  },
  sosQuickText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  sosMoreBtn: {
    backgroundColor: '#1e293b',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sosMoreText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '800',
  },
  abhaBanner: {
    backgroundColor: '#131d33',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTricolor: {
    flexDirection: 'row',
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tricolorSlice: {
    flex: 1,
    height: '100%',
  },
  smartChip: {
    width: 28,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#d97706',
    padding: 2,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  smartChipLine: {
    height: 2,
    backgroundColor: '#92400e',
    borderRadius: 1,
  },
  abhaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  abhaBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  abhaBadgeText: {
    color: '#93c5fd',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  abhaGovText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  abhaBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  abhaDetails: {
    flex: 1,
  },
  abhaName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  abhaNumber: {
    color: '#34d399',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0.8,
  },
  abhaSub: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 5,
    fontWeight: '500',
  },
  abhaHospital: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  abhaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
    marginTop: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedCheck: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '900',
  },
  abhaFooterText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '700',
  },
  abhaViewLink: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeader: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderSub: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#131d33',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    minHeight: 115,
    justifyContent: 'space-between',
    elevation: 3,
    position: 'relative',
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  actionDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  actionArrow: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontSize: 16,
    fontWeight: '900',
  },
  topicsList: {
    gap: 10,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  topicIcon: {
    fontSize: 28,
  },
  topicBody: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  topicTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  topicCategoryTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  topicCategoryText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '600',
  },
  topicPreview: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 15,
  },
  topicSchemeText: {
    color: '#60a5fa',
    fontSize: 10,
    marginTop: 4,
  },
  topicArrow: {
    color: '#4b5563',
    fontSize: 24,
    fontWeight: '300',
  },
  welfareCard: {
    backgroundColor: '#0c1a2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  welfareTitle: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  helplineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  helplinePill: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  helplinePillNum: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '800',
  },
  helplinePillName: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  welfareCover: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
});

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
          <View style={styles.emergencyTextWrap}>
            <Text style={styles.emergencyTitle}>🚨 {t('emergency_sos')}</Text>
            <Text style={styles.emergencySub}>Instant Ambulance & Police Dispatch</Text>
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
          <View style={styles.abhaHeader}>
            <View style={styles.abhaBadge}>
              <Text style={styles.abhaBadgeText}>ABDM DIGITAL HEALTH ID</Text>
            </View>
            <Text style={styles.abhaGovText}>Govt of India</Text>
          </View>

          <View style={styles.abhaBody}>
            <View style={styles.abhaDetails}>
              <Text style={styles.abhaName}>{activeProfile.name}</Text>
              <Text style={styles.abhaNumber}>{activeProfile.abhaId}</Text>
              <Text style={styles.abhaSub} numberOfLines={1}>
                {activeProfile.abhaAddress} • Policy: {activeProfile.policyNumber}
              </Text>
              <Text style={styles.abhaHospital} numberOfLines={1}>
                🏥 {activeProfile.linkedHip}
              </Text>
            </View>
          </View>

          <View style={styles.abhaFooter}>
            <Text style={styles.abhaFooterText}>✓ Cryptographically Linked & Verified</Text>
            <Text style={styles.abhaViewLink}>View Full Passport →</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Action Grid */}
        <Text style={styles.sectionHeader}>{t('quick_actions')}</Text>
        <View style={styles.actionGrid}>
          {/* Action 1: Symptom Triage */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#10b981' }]}
            onPress={() => navigation.navigate('ChatTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>🩺</Text>
            <Text style={styles.actionTitle}>{t('check_symptoms')}</Text>
            <Text style={styles.actionDesc}>Multi-Agent Swarm clinical reasoning</Text>
          </TouchableOpacity>

          {/* Action 2: Voice Doctor */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#06b6d4' }]}
            onPress={() => navigation.navigate('VoiceTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>🎙️</Text>
            <Text style={styles.actionTitle}>{t('voice_consult')}</Text>
            <Text style={styles.actionDesc}>Live Vapi voice consultation</Text>
          </TouchableOpacity>

          {/* Action 3: Medicine Safety */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#f59e0b' }]}
            onPress={() =>
              navigation.navigate('ChatTab', {
                initialPrompt:
                  'Check safe dosage and Indian brand timings for Dolo 650, ORS, and Pan-40',
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.actionTitle}>{t('medicine_safety')}</Text>
            <Text style={styles.actionDesc}>Verify dosage & timing (India)</Text>
          </TouchableOpacity>

          {/* Action 4: Vaccination Schedule */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#8b5cf6' }]}
            onPress={() =>
              navigation.navigate('ChatTab', {
                initialPrompt:
                  'Provide the Universal Immunization Programme (UIP) child vaccine schedule in India',
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>💉</Text>
            <Text style={styles.actionTitle}>{t('child_vaccines')}</Text>
            <Text style={styles.actionDesc}>National Immunization Schedule</Text>
          </TouchableOpacity>

          {/* Action 5: WhatsApp Clinical Bot */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#22c55e' }]}
            onPress={() => navigation.navigate('WhatsAppTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionTitle}>{t('whatsapp_bot')}</Text>
            <Text style={styles.actionDesc}>Plain-text bot & Meta Cloud sync</Text>
          </TouchableOpacity>

          {/* Action 6: Blockchain Records */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#3b82f6' }]}
            onPress={() => navigation.navigate('RecordsTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>⛓️</Text>
            <Text style={styles.actionTitle}>{t('verify_records')}</Text>
            <Text style={styles.actionDesc}>Ethereum Sepolia & IPFS ledger</Text>
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
    backgroundColor: '#090d16',
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
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '800',
  },
  emergencySub: {
    color: '#fca5a5',
    fontSize: 11,
    marginTop: 2,
  },
  emergencyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosQuickBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sosQuickText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  sosMoreBtn: {
    backgroundColor: '#1e293b',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sosMoreText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  abhaBanner: {
    backgroundColor: '#131d33',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  abhaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  abhaBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  abhaBadgeText: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  abhaGovText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '800',
  },
  abhaNumber: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  abhaSub: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 4,
  },
  abhaHospital: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  abhaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    marginTop: 10,
  },
  abhaFooterText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '600',
  },
  abhaViewLink: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderSub: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    minHeight: 105,
    justifyContent: 'space-between',
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  actionTitle: {
    color: '#f9fafb',
    fontSize: 13,
    fontWeight: '700',
  },
  actionDesc: {
    color: '#9ca3af',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
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

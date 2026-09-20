import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { RuralTopic } from '../types';

interface RuralTopicDetailModalProps {
  topic: RuralTopic | null;
  visible: boolean;
  onClose: () => void;
}

export const RuralTopicDetailModal: React.FC<RuralTopicDetailModalProps> = ({
  topic,
  visible,
  onClose,
}) => {
  if (!topic) return null;

  const dialEmergency = () => {
    Linking.openURL('tel:108');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.icon}>{topic.icon}</Text>
              <View style={styles.titleWrap}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{topic.category}</Text>
                </View>
                <Text style={styles.title}>{topic.title}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Step-by-Step Instructions */}
            <Text style={styles.sectionHeader}>Action Protocol Steps</Text>
            {topic.steps.map((step, idx) => (
              <View key={idx} style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
              </View>
            ))}

            {/* Red Flag Warning */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeaderRow}>
                <Text style={styles.warningTitle}>⚠️ Emergency Warning / Red Flags</Text>
                <TouchableOpacity style={styles.call108Pill} onPress={dialEmergency}>
                  <Text style={styles.call108Text}>📞 Call 108</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.warningText}>{topic.redFlag}</Text>
            </View>

            {/* Government Welfare Scheme */}
            <View style={styles.schemeBox}>
              <Text style={styles.schemeTitle}>🏛️ Government Scheme / Free Benefit</Text>
              <Text style={styles.schemeText}>{topic.scheme}</Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
              <Text style={styles.dismissBtnText}>Understood & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderColor: '#1e3a5f',
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  icon: {
    fontSize: 34,
  },
  titleWrap: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '700',
  },
  scrollArea: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 14,
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#131f37',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  stepNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  stepDetail: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 19,
  },
  warningBox: {
    backgroundColor: '#261214',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  warningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '900',
    flex: 1,
  },
  call108Pill: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  call108Text: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  warningText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 18,
  },
  schemeBox: {
    backgroundColor: '#0c1e3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  schemeTitle: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  schemeText: {
    color: '#bfdbfe',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  dismissBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dismissBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

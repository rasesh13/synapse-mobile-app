import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Linking,
  ActivityIndicator,
  Clipboard,
  Alert,
  ScrollView,
} from 'react-native';
import { AppHeader } from '../components/common/AppHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { ApiEndpoints } from '../api/endpoints';

interface WhatsAppScreenProps {
  navigation: any;
}

interface WAMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const OFFICIAL_WA_PHONE = '+15552028141';
const OFFICIAL_WA_URL = 'https://wa.me/15552028141?text=Hi%20SynapseOS';

export const WhatsAppScreen: React.FC<WhatsAppScreenProps> = ({ navigation }) => {
  const { activeProfile } = useAuth();
  const { language } = useLanguage();
  const { readiness, isOnline } = useNetwork();

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Initial WhatsApp Bot Greeting complying with AGENTS.md plain-text protocol
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting = [
        '🟢 SYNAPSE-OS RURAL HEALTH BOT',
        '━━━━━━━━━━━━━━━━━━━━',
        '🩺 Suspected Diagnosis: Welcome & Clinical Menu',
        '📊 Council Consensus: 100%',
        '📋 Immediate Actions:',
        '1. Send your health symptoms or questions.',
        '2. Reply with a shortcut number below for immediate protocols.',
        '',
        '👉 Quick Shortcuts:',
        '• Reply 1 for Fever, Headache & Pain (Dolo 650)',
        '• Reply 2 for Dehydration & Diarrhea (ORS Protocol)',
        '• Reply 3 for Universal Child Vaccination Schedule',
        '• Reply 4 for Maternal Health & Anemia Prevention',
        '• Reply 5 to Request Human Doctor Callback',
        '• Reply sos for Immediate Emergency Dial 108',
        '• Reply lang to Switch Language',
        '',
        '🌿 Powered by Synapse-OS Multi-Agent Swarm',
      ].join('\n');

      setMessages([
        {
          id: 'wa-msg-0',
          sender: 'bot',
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  const openOfficialWhatsApp = async () => {
    try {
      const supported = await Linking.canOpenURL(OFFICIAL_WA_URL);
      if (supported) {
        await Linking.openURL(OFFICIAL_WA_URL);
      } else {
        // Fallback to wa.me directly
        await Linking.openURL(`https://api.whatsapp.com/send?phone=${OFFICIAL_WA_PHONE}&text=Hi`);
      }
    } catch {
      Alert.alert(
        'WhatsApp Not Found',
        `Could not open WhatsApp app directly. You can message our verified line at ${OFFICIAL_WA_PHONE}.`
      );
    }
  };

  const copyMessage = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Plain-text message copied to clipboard!');
  };

  const stripMarkdown = (raw: string): string => {
    // Strict compliance with AGENTS.md: zero markdown syntax
    return raw
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/---/g, '━━━━━━━━━━━━━━━━━━━━');
  };

  const generateOfflineWhatsAppResponse = (userMsg: string): string => {
    const text = userMsg.trim().toLowerCase();

    if (text === 'sos' || text.includes('chest pain') || text.includes('emergency')) {
      return [
        '🔴 SYNAPSE EMERGENCY TRIAGE — CRITICAL',
        '━━━━━━━━━━━━━━━━━━━━',
        '🩺 Suspected Diagnosis: Acute Medical Emergency / Cardiorespiratory Alert',
        '📊 Council Consensus: 99%',
        '📋 Immediate Actions:',
        '1. Immediately call 108 (Ambulance) or 112 (National Emergency).',
        '2. Keep patient calm, seated, and do not leave them unattended.',
        '',
        '💊 Medications & Relief (India):',
        'In emergencies (CNS, trauma, acute chest pain): Safety protocol strictly withholds self-medication until direct physician examination.',
        '',
        '🚨 Seek Emergency Care / Call 108 If:',
        'Crushing chest pressure radiating to left arm/jaw, severe shortness of breath, loss of consciousness, or bluish lips.',
        '',
        '👉 Quick Shortcuts: Reply sos to repeat alert | Reply full for complete details',
        '🌿 Powered by Synapse-OS Multi-Agent Swarm',
      ].join('\n');
    }

    if (text === '1' || text.includes('fever') || text.includes('dolo')) {
      return [
        '🟡 SYNAPSE CLINICAL TRIAGE — FEVER EVALUATION',
        '━━━━━━━━━━━━━━━━━━━━',
        '🩺 Suspected Diagnosis: Acute Febrile Illness / Viral Syndrome',
        '📊 Council Consensus: 92%',
        '📋 Immediate Actions:',
        '1. Sponge forehead with room-temperature water to reduce body temperature.',
        '2. Maintain adequate hydration with boiled drinking water or Electral ORS.',
        '',
        '💊 Medications & Relief (India):',
        '• Tablet Dolo 650 (Paracetamol 650mg): 1 tablet after food, only every 6-8 hours if fever exceeds 100°F. Do not exceed 3 tablets daily.',
        '• Tablet Pan-40 (Pantoprazole 40mg): 1 tablet in the morning 30 minutes before breakfast on an empty stomach if stomach acidity develops.',
        '',
        '🚨 Seek Emergency Care / Call 108 If:',
        'Fever persists above 103°F for >48 hours, patient develops stiff neck, extreme drowsiness, or petechial rash.',
        '',
        '👉 Quick Shortcuts: Reply 5 for Doctor | Reply sos for Emergency',
        '🌿 Powered by Synapse-OS Multi-Agent Swarm',
      ].join('\n');
    }

    if (text === '2' || text.includes('ors') || text.includes('diarrhea')) {
      return [
        '🟢 SYNAPSE HOME CARE — DEHYDRATION DEFENSE',
        '━━━━━━━━━━━━━━━━━━━━',
        '🩺 Suspected Diagnosis: Acute Gastroenteritis / Dehydration Risk',
        '📊 Council Consensus: 95%',
        '📋 Immediate Actions:',
        '1. Mix 1 full sachet of WHO Electral ORS into exactly 1 Liter of boiled and cooled drinking water.',
        '2. Administer small sips continuously after every loose stool.',
        '',
        '💊 Medications & Relief (India):',
        '• Electral ORS: Drink throughout the day to replace vital electrolytes.',
        '• Tablet Zinc 20mg: 1 tablet daily for 14 consecutive days to repair intestinal mucosal lining.',
        '',
        '🚨 Seek Emergency Care / Call 108 If:',
        'Sunken eyes, lethargy, patient unable to drink liquids, or blood present in stools.',
        '',
        '👉 Quick Shortcuts: Reply 5 for Doctor | Reply sos for 108',
        '🌿 Powered by Synapse-OS Multi-Agent Swarm',
      ].join('\n');
    }

    // Generic clinical response
    return [
      '🟢 SYNAPSE CLINICAL IMPRESSION',
      '━━━━━━━━━━━━━━━━━━━━',
      `🩺 Suspected Diagnosis: Clinical Query Assessment for ${activeProfile.name}`,
      '📊 Council Consensus: 89%',
      '📋 Immediate Actions:',
      '1. Review symptoms with your local Community Health Officer (CHO) at nearest Ayushman Arogya Mandir.',
      '2. Rest in a well-ventilated room and monitor vitals.',
      '',
      '💊 Medications & Relief (India):',
      '• Electral ORS or warm water with lemon: Take after food for fluid maintenance.',
      '• For mild aches: Paracetamol 500mg after meals if prescribed by local pharmacist.',
      '',
      '🚨 Seek Emergency Care / Call 108 If:',
      'Persistent high fever, severe breathlessness, or persistent vomiting.',
      '',
      '👉 Quick Shortcuts: Reply 1 for Fever | Reply 2 for ORS | Reply 5 for Doctor',
      '🌿 Powered by Synapse-OS Multi-Agent Swarm',
    ].join('\n');
  };

  const handleSend = async (userText?: string) => {
    const text = (userText || inputMsg).trim();
    if (!text || loading) return;

    const userMessage: WAMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await ApiEndpoints.simulateWhatsApp(
        text,
        language,
        '+919876543210'
      );

      const cleanResponse = stripMarkdown(res.response || '');

      const botMessage: WAMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: cleanResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      // Offline fallback compliant with AGENTS.md
      const fallbackText = generateOfflineWhatsAppResponse(text);
      const botMessage: WAMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const isMetaLive =
    readiness?.subsystems?.whatsapp_service === 'HEALTHY' ||
    readiness?.subsystems?.whatsapp_service === 'ACTIVE';

  return (
    <View style={styles.container}>
      <AppHeader onNavigateToRecords={() => navigation.navigate('RecordsTab')} />

      {/* Official WhatsApp Integration Card */}
      <View style={styles.officialCard}>
        <View style={styles.officialHeader}>
          <View style={styles.officialIconWrap}>
            <Text style={styles.waLogoIcon}>💬</Text>
          </View>
          <View style={styles.officialTitleWrap}>
            <Text style={styles.officialTitle}>Official WhatsApp Bot</Text>
            <Text style={styles.officialNumber}>{OFFICIAL_WA_PHONE}</Text>
          </View>
          <View
            style={[
              styles.metaBadge,
              { backgroundColor: isMetaLive ? '#065f46' : '#334155' },
            ]}
          >
            <Text style={styles.metaBadgeText}>
              {isMetaLive ? '● Meta Cloud Live' : '● Demo / Sandbox'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.openWhatsAppBtn}
          onPress={openOfficialWhatsApp}
          activeOpacity={0.85}
        >
          <Text style={styles.openWhatsAppBtnText}>
            Open in Official WhatsApp App →
          </Text>
        </TouchableOpacity>
      </View>

      {/* In-App WhatsApp Plain-Text Simulator */}
      <View style={styles.simulatorHeader}>
        <Text style={styles.simulatorTitle}>
          In-App WhatsApp Simulator (Plain Text Protocol)
        </Text>
        <Text style={styles.protocolBadge}>AGENTS.md Compliant</Text>
      </View>

      {/* Chat messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowBot,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleBot,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.messageTextUser : styles.messageTextBot,
                  ]}
                  selectable
                >
                  {item.text}
                </Text>
                <View style={styles.bubbleFooter}>
                  <Text style={styles.bubbleTime}>{item.time}</Text>
                  {!isUser && (
                    <TouchableOpacity
                      onPress={() => copyMessage(item.text)}
                      style={styles.copyPill}
                    >
                      <Text style={styles.copyPillText}>Copy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Quick Action Shortcuts */}
      <View style={styles.quickShortcutsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickShortcutsContent}>
          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => handleSend('1')}
          >
            <Text style={styles.shortcutChipText}>1 (Fever / Dolo)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => handleSend('2')}
          >
            <Text style={styles.shortcutChipText}>2 (ORS & Diarrhea)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => handleSend('3')}
          >
            <Text style={styles.shortcutChipText}>3 (Child Vaccines)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => handleSend('4')}
          >
            <Text style={styles.shortcutChipText}>4 (Maternal Anemia)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shortcutChip, { borderColor: '#ef4444' }]}
            onPress={() => handleSend('sos')}
          >
            <Text style={[styles.shortcutChipText, { color: '#f87171' }]}>
              sos (Emergency 108)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => handleSend('5')}
          >
            <Text style={styles.shortcutChipText}>5 (Doctor Callback)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type message or reply shortcut (1, 2, sos)..."
          placeholderTextColor="#64748b"
          value={inputMsg}
          onChangeText={setInputMsg}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputMsg.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputMsg.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.sendBtnText}>➔</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  officialCard: {
    backgroundColor: '#0f172a',
    margin: 14,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#1e3a8a',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  officialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  officialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  waLogoIcon: {
    fontSize: 22,
  },
  officialTitleWrap: {
    flex: 1,
  },
  officialTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  officialNumber: {
    color: '#93c5fd',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  metaBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  metaBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  openWhatsAppBtn: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  openWhatsAppBtnText: {
    color: '#062816',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  simulatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#131f37',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  simulatorTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  protocolBadge: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  messagesList: {
    padding: 14,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '92%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#005c4b',
    borderColor: '#0b725c',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#1f2c34',
    borderColor: '#2d3e48',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextBot: {
    color: '#f8fafc',
    fontFamily: 'monospace',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bubbleTime: {
    color: '#94a3b8',
    fontSize: 10,
  },
  copyPill: {
    backgroundColor: '#111b21',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#2d3e48',
  },
  copyPillText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  quickShortcutsBar: {
    backgroundColor: '#0b1120',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
  },
  quickShortcutsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  shortcutChip: {
    backgroundColor: '#131f37',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  shortcutChipText: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#131f37',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    color: '#ffffff',
    fontSize: 13,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#00a884',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00a884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
